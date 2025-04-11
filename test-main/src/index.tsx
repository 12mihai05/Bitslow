import { serve } from "bun";
import { Database } from "bun:sqlite";
import { seedDatabase } from "./seed";
import index from "./index.html";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { computeBitSlow, generateDistinctRandomValues } from "./bitslow";

import { Client } from "./types/client";
import { PublicClient } from "./types/publicClient";
import { PublicTransaction, Transaction } from "./types/transaction";
import { Coin } from "./types/coin";
import { TransactionQuery } from "./types/transaction-querries";

const db = new Database(":memory:");
const secretKey = String(process.env.JWT_SECRET);
const endpoint_url = String(process.env.BUN_PUBLIC_ENDPOINT_URL);

seedDatabase(db, {
  clientCount: 30,
  bitSlowCount: 20,
  transactionCount: 50,
  clearExisting: true,
});

function requireAuth(req: Bun.BunRequest): { userId: number } | Response {
  const token = req.cookies.get("token");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as { userId: number };
    return { userId: decoded.userId };
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}

const generateToken = (userId: number) =>
  jwt.sign({ userId }, secretKey, { expiresIn: "3h" });

const hashPassword = async (password: string) =>
  bcrypt.hash(password, await bcrypt.genSalt(10));

const comparePassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);

const corsHeaders = {
  "Access-Control-Allow-Origin": endpoint_url,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

const server = serve({
  routes: {
    "/*": index,

    "/api/transactions": {
      GET: (req: Bun.BunRequest) => {
        const auth = requireAuth(req);
        if (auth instanceof Response) return auth;

        try {
          const url = new URL(req.url);
          const page = Number(url.searchParams.get("page")) || 1;
          const limit = Number(url.searchParams.get("limit")) || 15;
          const offset = (page - 1) * limit;

          const queryParams: TransactionQuery = {
            buyer: url.searchParams.get("buyer") || undefined,
            seller: url.searchParams.get("seller") || undefined,
            minValue: url.searchParams.get("minValue") || undefined,
            maxValue: url.searchParams.get("maxValue") || undefined,
            startDate: url.searchParams.get("startDate") || undefined,
            endDate: url.searchParams.get("endDate") || undefined,
          };

          const sortBy = url.searchParams.get("sortBy") || "transaction_date";
          const rawOrder = url.searchParams.get("sortOrder") || "desc";
          const sortOrder =
            rawOrder.toLowerCase() === "asc"
              ? "ASC"
              : rawOrder.toLowerCase() === "desc"
              ? "DESC"
              : null;

          const allowedSortFields: Record<string, string> = {
            id: "t.id",
            coin_id: "t.coin_id",
            amount: "t.amount",
            transaction_date: "t.transaction_date",
            hash: "t.hash",
            buyer_name: "buyer.name",
            seller_name: "seller.name",
            value: "c.value",
          };

          const sortColumn = allowedSortFields[sortBy] || "t.transaction_date";

          const filters: string[] = [];
          const params: (string | number)[] = [];

          if (queryParams.buyer) {
            filters.push("buyer.name LIKE ?");
            params.push(`%${queryParams.buyer}%`);
          }
          if (queryParams.seller) {
            filters.push("seller.name LIKE ?");
            params.push(`%${queryParams.seller}%`);
          }
          if (queryParams.minValue) {
            filters.push("c.value >= ?");
            params.push(Number(queryParams.minValue));
          }
          if (queryParams.maxValue) {
            filters.push("c.value <= ?");
            params.push(Number(queryParams.maxValue));
          }
          if (queryParams.startDate) {
            filters.push("t.transaction_date >= ?");
            params.push(queryParams.startDate);
          }
          if (queryParams.endDate) {
            filters.push("t.transaction_date <= ?");
            params.push(queryParams.endDate);
          }

          const whereClause = filters.length
            ? `WHERE ${filters.join(" AND ")}`
            : "";

          const baseQuery = `
        FROM transactions t
        LEFT JOIN clients seller ON t.seller_id = seller.id
        LEFT JOIN clients buyer ON t.buyer_id = buyer.id
        JOIN coins c ON t.coin_id = c.coin_id
        ${whereClause}
      `;

          const totalCount = db
            .query(`SELECT COUNT(*) as count ${baseQuery}`)
            .get(...params) as { count: number };

          let orderClause = `ORDER BY t.transaction_date DESC`;

          if (sortOrder && sortColumn) {
            const nullLastClause =
              sortBy === "buyer_name" || sortBy === "seller_name"
                ? `${sortColumn} IS NULL, ${sortColumn} ${sortOrder}`
                : `${sortColumn} ${sortOrder}`;
            orderClause = `ORDER BY ${nullLastClause}`;
          }

          const results = db
            .query(
              `
          SELECT 
            t.id, t.coin_id, t.amount, t.transaction_date, t.hash,
            seller.id as seller_id, seller.name as seller_name,
            buyer.id as buyer_id, buyer.name as buyer_name,
            c.bit1, c.bit2, c.bit3, c.value
          ${baseQuery}
          ${orderClause}
          LIMIT ? OFFSET ?
        `
            )
            .all(...params, limit, offset) as Transaction[];

          const enriched = results.map((tx) => ({
            ...tx,
          }));

          return Response.json({
            transactions: enriched,
            total: totalCount.count,
            page,
            limit,
          });
        } catch (err) {
          console.error("Transaction fetch failed", err);
          return new Response("Error fetching transactions", { status: 500 });
        }
      },
    },

    "/api/register": {
      POST: async (req: Bun.BunRequest) => {
        const { name, email, password } = await req.json();
        if (!name || !email || !password) {
          return new Response(JSON.stringify({ error: "Missing fields" }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const exists = db
          .query("SELECT id FROM clients WHERE email = ?")
          .get(email);
        if (exists) return new Response("Email already taken", { status: 400 });

        const password_hash = await hashPassword(password);
        const result = db.run(
          `INSERT INTO clients (name, email, password_hash)
           VALUES (?, ?, ?)`,
          [name, email, password_hash]
        );

        const token = generateToken(Number(result.lastInsertRowid));
        req.cookies.set("token", token, {
          httpOnly: true,
          secure: true,
          path: "/",
          maxAge: 10800,
        });

        return Response.json({ message: "Registration successful!" });
      },
    },

    "/api/login": {
      POST: async (req) => {
        const { email, password } = await req.json();
        const user = db
          .query("SELECT id, password_hash FROM clients WHERE email = ?")
          .get(email) as Client | undefined;

        if (!user || !(await comparePassword(password, user.password_hash))) {
          return new Response("Invalid email or password", { status: 400 });
        }

        const token = generateToken(user.id);
        req.cookies.set("token", token, {
          httpOnly: true,
          secure: true,
          path: "/",
          maxAge: 10800,
        });

        return Response.json({ message: "Login successful!" });
      },
    },

    "/api/check-token": {
      GET: (req) => {
        const token = req.cookies.get("token");
        if (!token) {
          return Response.json({ valid: false });
        }

        try {
          const { userId } = jwt.verify(token, secretKey) as { userId: number };
          const userExists = db
            .query("SELECT id FROM clients WHERE id = ?")
            .get(userId);

          if (!userExists) {
            return Response.json({ valid: false });
          }

          return Response.json({ valid: true });
        } catch {
          return new Response("Invalid token", { status: 401 });
        }
      },
    },

    "/api/logout": {
      POST: (req) => {
        req.cookies.delete({ name: "token", path: "/", domain: "localhost" });
        return Response.json({ message: "Logged out" });
      },
    },

    "/api/profile": {
      GET: async (req: Bun.BunRequest) => {
        const auth = requireAuth(req);
        if (auth instanceof Response) return auth;
        const { userId } = auth;

        const url = new URL(req.url);
        const type = url.searchParams.get("type");
        const subType = url.searchParams.get("subtype");
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;
        const isSummary = url.searchParams.get("summary") === "true";

        const dbClient = db
          .query(
            `
          SELECT name, email, phone, address, created_at
          FROM clients WHERE id = ?
        `
          )
          .get(userId) as Omit<PublicClient, "coins" | "clientTransactions">;

        if (!dbClient) {
          return Response.json({ error: "Client not found" }, { status: 404 });
        }

        const { count: totalCoins } = db
          .query(
            `
          SELECT COUNT(*) as count FROM coins WHERE client_id = ?
        `
          )
          .get(userId) as { count: number };

        const { count: totalBuyerTx } = db
          .query(
            `
          SELECT COUNT(*) as count FROM transactions WHERE buyer_id = ?
        `
          )
          .get(userId) as { count: number };

        const { count: totalSellerTx } = db
          .query(
            `
          SELECT COUNT(*) as count FROM transactions WHERE seller_id = ?
        `
          )
          .get(userId) as { count: number };

        const totalTransactions = totalBuyerTx + totalSellerTx;

        const { totalValue } = db
          .query(
            `
          SELECT SUM(value) as totalValue FROM coins WHERE client_id = ?
        `
          )
          .get(userId) as { totalValue: number | null };

        const mapTransaction = (tx: any): PublicTransaction => ({
          id: tx.id,
          amount: tx.amount,
          transaction_date: tx.transaction_date,
          hash: tx.hash,
          buyer_name: tx.buyer_name,
          seller_name: tx.seller_name,
          bit1: tx.bit1,
          bit2: tx.bit2,
          bit3: tx.bit3,
          value: tx.value,
        });

        const mapCoin = (coin: any): Coin => ({
          coin_id: coin.coin_id,
          client_id: coin.client_id,
          bit1: coin.bit1,
          bit2: coin.bit2,
          bit3: coin.bit3,
          value: coin.value,
          hash: coin.hash,
          for_sale: !!coin.for_sale,
          created_at: coin.created_at,
          owner: coin.owner_name,
        });

        const fetchCoins = (): Coin[] =>
          db
            .query(
              `
          SELECT 
            c.coin_id, c.client_id, c.bit1, c.bit2, c.bit3, c.value, c.hash,
            c.for_sale, DATE(c.created_at) AS created_at, cl.name AS owner_name
          FROM coins c
          LEFT JOIN clients cl ON c.owner_id = cl.id
          WHERE c.client_id = ?
          ORDER BY c.created_at DESC
          LIMIT ? OFFSET ?
        `
            )
            .all(userId, limit, offset)
            .map(mapCoin);

        const fetchBuyerTransactions = (): PublicTransaction[] =>
          db
            .query(
              `
          SELECT t.id, t.amount, t.transaction_date, t.hash,
                 s.name AS seller_name, b.name AS buyer_name,
                 c.bit1, c.bit2, c.bit3, c.value
          FROM transactions t
          LEFT JOIN clients s ON t.seller_id = s.id
          LEFT JOIN clients b ON t.buyer_id = b.id
          JOIN coins c ON t.coin_id = c.coin_id
          WHERE t.buyer_id = ?
          ORDER BY t.transaction_date DESC
          LIMIT ? OFFSET ?
        `
            )
            .all(userId, limit, offset)
            .map(mapTransaction);

        const fetchSellerTransactions = (): PublicTransaction[] =>
          db
            .query(
              `
                  SELECT 
                    t.id, t.amount, t.transaction_date, t.hash,
                    b.name AS buyer_name,
                    s.name AS seller_name, 
                    c.bit1, c.bit2, c.bit3, c.value
                  FROM transactions t
                  LEFT JOIN clients b ON t.buyer_id = b.id
                  LEFT JOIN clients s ON t.seller_id = s.id
                  JOIN coins c ON t.coin_id = c.coin_id
                  WHERE t.seller_id = ?
                  ORDER BY t.transaction_date DESC
                  LIMIT ? OFFSET ?
                `
            )
            .all(userId, limit, offset)
            .map(mapTransaction);

        if (isSummary) {
          return Response.json({
            client: dbClient,
            coinsOwned: totalCoins,
            totalValue: totalValue ?? 0,
            transactions: {
              total: totalTransactions,
              buyer: totalBuyerTx,
              seller: totalSellerTx,
            },
          });
        }

        if (type && type !== "coins" && type !== "transactions") {
          return Response.json(
            { error: "Invalid 'type' query parameter" },
            { status: 400 }
          );
        }

        if (type === "coins") {
          return Response.json({
            coins: fetchCoins(),
            page,
            totalPages: Math.ceil(totalCoins / limit),
          });
        }

        if (type === "transactions") {
          if (subType === "buyer") {
            return Response.json({
              buyerTransactions: fetchBuyerTransactions(),
              page,
              totalPages: Math.ceil(totalBuyerTx / limit),
            });
          }

          if (subType === "seller") {
            return Response.json({
              sellerTransactions: fetchSellerTransactions(),
              page,
              totalPages: Math.ceil(totalSellerTx / limit),
            });
          }

          return Response.json({
            buyerTransactions: fetchBuyerTransactions(),
            sellerTransactions: fetchSellerTransactions(),
            page,
          });
        }

        return Response.json({
          client: {
            ...dbClient,
            coins: fetchCoins(),
            clientTransactions: fetchBuyerTransactions(),
            sellerTransactions: fetchSellerTransactions(),
          },
          coinsOwned: totalCoins,
          totalValue: totalValue ?? 0,
          transactions: {
            total: totalTransactions,
            buyer: totalBuyerTx,
            seller: totalSellerTx,
          },
        });
      },

      PATCH: async (req: Bun.BunRequest) => {
        const auth = requireAuth(req);
        if (auth instanceof Response) return auth;

        const { userId } = auth;
        const { name, email, phone, address } = await req.json();

        if (
          typeof name !== "string" ||
          typeof email !== "string" ||
          typeof phone !== "string" ||
          typeof address !== "string"
        ) {
          return new Response("Invalid input", { status: 400 });
        }

        try {
          db.run(
            `UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?`,
            [name, email, phone, address, userId]
          );

          return Response.json({ message: "Profile updated successfully." });
        } catch (error) {
          console.error("Error updating profile:", error);
          return Response.json(
            { error: "Failed to update profile" },
            { status: 500 }
          );
        }
      },

      POST: async (req: Bun.BunRequest) => {
        const auth = requireAuth(req);
        if (auth instanceof Response) return auth;

        const { userId } = auth;
        const {
          coin_id,
          action,
        }: { coin_id: number; action: "list" | "unlist" } = await req.json();

        if (!coin_id || !["list", "unlist"].includes(action)) {
          return Response.json(
            { error: "Missing coin_id or invalid action" },
            { status: 400 }
          );
        }

        try {
          const result = db.run(
            `UPDATE coins SET for_sale = ? WHERE coin_id = ? AND client_id = ?`,
            [action === "list" ? 1 : 0, coin_id, userId]
          );

          if (result.changes === 0) {
            return Response.json(
              {
                error:
                  "No changes made. Coin might not be yours or doesn't exist.",
              },
              { status: 400 }
            );
          }

          return Response.json({
            message: action === "list" ? "Coin listed." : "Coin unlisted.",
          });
        } catch (error) {
          console.error("Toggle sale status failed:", error);
          return Response.json(
            { error: "Server error while updating coin status" },
            { status: 500 }
          );
        }
      },
    },

    "/api/market": {
      GET: (req: Bun.BunRequest) => {
        const auth = requireAuth(req);
        if (auth instanceof Response) return auth;
        const { userId } = auth;

        try {
          const url = new URL(req.url);
          const page = parseInt(url.searchParams.get("page") || "1");
          const limit = parseInt(url.searchParams.get("limit") || "30");
          const offset = (page - 1) * limit;

          const baseCondition = `WHERE c.for_sale = 1 OR c.client_id IS NULL`;

          const totalCountQuery = `
            SELECT COUNT(*) as count
            FROM coins c
            LEFT JOIN clients cl ON c.owner_id = cl.id
            ${baseCondition}
          `;

          const totalCount = db.query(totalCountQuery).get() as {
            count: number;
          };

          const resultsQuery = `
            SELECT 
              c.coin_id,
              c.client_id,
              c.hash,
              c.bit1,
              c.bit2,
              c.bit3,
              c.value,
              DATE(c.created_at) AS created_at,
              cl.name AS owner
            FROM coins c
            LEFT JOIN clients cl ON c.owner_id = cl.id
            ${baseCondition}
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
          `;

          const coins = db
            .query(resultsQuery)
            .all(limit, offset)
            .map((coin: any) => ({
              ...coin,
            }));

          return Response.json({
            coins,
            total: totalCount.count,
            page,
            limit,
            userId,
            totalPages: Math.ceil(totalCount.count / limit),
          });
        } catch (err) {
          console.error("Marketplace coin fetch failed", err);
          return new Response("Error fetching marketplace coins", {
            status: 500,
          });
        }
      },

      POST: async (req: Bun.BunRequest) => {
        const auth = requireAuth(req);
        if (auth instanceof Response) return auth;

        const maxAttempts = 100;
        let attempts = 0;

        while (attempts < maxAttempts) {
          const [bit1, bit2, bit3] = generateDistinctRandomValues(3, 1, 10);
          const hash = computeBitSlow(bit1, bit2, bit3);
          const value = Math.floor(Math.random() * 90_000) + 10_000;

          try {
            const result = db.run(
              `INSERT INTO coins (hash, bit1, bit2, bit3, value, created_at)
               VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [hash, bit1, bit2, bit3, value]
            );

            return Response.json({
              coin_id: result.lastInsertRowid,
              bit1,
              bit2,
              bit3,
              hash,
              value,
            });
          } catch (err: any) {
            if (
              err.message.includes("UNIQUE") ||
              err.message.includes("constraint")
            ) {
              attempts++;
              continue;
            }

            console.error("Unexpected DB error:", err);
            return new Response("Database error", { status: 500 });
          }
        }

        return new Response(
          JSON.stringify({
            error: "No available unique coin combinations left.",
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
    },
    "/api/market/buy": {
      POST: async (req: Bun.BunRequest) => {
        const auth = requireAuth(req);
        if (auth instanceof Response) return auth;
        const { userId } = auth;

        const body = await req.json();
        const coinId = body.coin_id;

        if (!coinId) {
          return new Response("Missing coin_id", { status: 400 });
        }

        try {
          const coin = db
            .query(
              `
          SELECT * FROM coins
          WHERE coin_id = ? AND (for_sale = 1 OR client_id IS NULL)
        `
            )
            .get(coinId) as Coin;

          if (!coin) {
            return new Response("Coin is not available for purchase", {
              status: 403,
            });
          }

          if (coin.client_id === userId) {
            return new Response("You cannot buy your own coin", {
              status: 400,
            });
          }

          const sellerId = coin.client_id ?? null;
          const amount = coin.value;
          const hash = coin.hash;

          db.run(
            `INSERT INTO transactions (coin_id, seller_id, buyer_id, amount, hash)
         VALUES (?, ?, ?, ?, ?)`,
            [coinId, sellerId, userId, amount, hash]
          );

          db.run(
            `UPDATE coins
         SET client_id = ?, owner_id = ?, for_sale = 0
         WHERE coin_id = ?`,
            [userId, userId, coinId]
          );

          db.run(
            `INSERT INTO coin_history (coin_id, client_id)
             VALUES (?, ?)`,
            [coinId, userId]
          );

          return Response.json({ success: true, coin_id: coinId });
        } catch (err) {
          console.error("Buy error:", err);
          return new Response("Failed to process purchase", { status: 500 });
        }
      },
    },

    "/api/coin-history": {
      GET: async (req: Bun.BunRequest) => {
        const auth = requireAuth(req);
        if (auth instanceof Response) return auth;

        try {
          const url = new URL(req.url);
          const coinId = url.searchParams.get("coin_id");

          if (!coinId) {
            return new Response("Missing coin_id", { status: 400 });
          }

          const history = db
            .query(
              `
          SELECT ch.client_id, cl.name AS client_name, ch.timestamp
          FROM coin_history ch
          JOIN clients cl ON ch.client_id = cl.id
          WHERE ch.coin_id = ?
          ORDER BY ch.timestamp ASC
        `
            )
            .all(Number(coinId)) as {
            client_id: number;
            client_name: string;
            timestamp: string;
          }[];

          return Response.json({ history });
        } catch (err) {
          console.error("Failed to fetch coin history:", err);
          return new Response("Failed to fetch coin history", { status: 500 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
