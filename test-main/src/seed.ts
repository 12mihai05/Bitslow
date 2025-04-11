import { Database } from "bun:sqlite";
import { faker } from "@faker-js/faker";
import { CryptoHasher } from "bun";
import bcrypt from "bcryptjs";
import { computeBitSlow } from "./bitslow";

/**
 * Initialize database schema and seed with random data
 * @param db SQLite database instance
 * @param options Configuration options for seeding
 */
export function seedDatabase(
  db: Database,
  options: {
    clientCount?: number;
    bitSlowCount?: number;
    transactionCount?: number;
    clearExisting?: boolean;
  } = {}
) {
  const {
    clientCount = 20,
    bitSlowCount = 50,
    transactionCount = 100,
    clearExisting = false,
  } = options;

  console.log("🌱 Initializing database schema and seeding data...");

  if (clearExisting) {
    console.log("🗑️ Clearing existing data...");
    db.exec(`
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS coins;
      DROP TABLE IF EXISTS clients;
    `);
  }

  // Initialize database schema

  initializeSchema(db);
  const usedCombinations = new Set<string>();

  const testUserId = createTestUser(db, usedCombinations);
  const clients = seedClients(db, clientCount);
  const coins = seedCoins(db, bitSlowCount, clients.length, usedCombinations);
  seedTransactions(db, transactionCount, coins.length, clients.length);

  console.log("✅ Database seeding complete!");
  console.log(
    `📊 Generated ${clientCount} clients, ${bitSlowCount} BitSlows, and ${transactionCount} transactions.`
  );

  return {
    clients,
    coins,
    transactionCount,
    testUserId,
  };
}

/**
 * Initialize database schema
 */
function initializeSchema(db: Database) {
  console.log("📝 Creating tables if they don't exist...");

  db.exec(`
	  -- Create clients table
	  CREATE TABLE IF NOT EXISTS clients (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		phone TEXT,
		address TEXT,
		password_hash TEXT NOT NULL,
		bitSlowBalance INTEGER DEFAULT 0,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	  );
  
	  -- Create coins table
	  CREATE TABLE IF NOT EXISTS coins (
		coin_id INTEGER PRIMARY KEY AUTOINCREMENT,
		client_id INTEGER,
		owner_id INTEGER,
		hash TEXT UNIQUE NOT NULL,
		bit1 INTEGER NOT NULL,
		bit2 INTEGER NOT NULL,
		bit3 INTEGER NOT NULL,
		value REAL NOT NULL,
		for_sale BOOLEAN DEFAULT TRUE,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (client_id) REFERENCES clients (id),
		FOREIGN KEY (owner_id) REFERENCES clients (id) ON DELETE SET NULL,
		UNIQUE (bit1, bit2, bit3)
	  );
  
	  -- Create transactions table
	  CREATE TABLE IF NOT EXISTS transactions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		coin_id INTEGER NOT NULL,
		seller_id INTEGER,
		buyer_id INTEGER NOT NULL,
		amount REAL NOT NULL,
		hash TEXT NOT NULL,
		transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (coin_id) REFERENCES coins (coin_id) ON DELETE CASCADE,
		FOREIGN KEY (seller_id) REFERENCES clients (id) ON DELETE SET NULL,
		FOREIGN KEY (buyer_id) REFERENCES clients (id) ON DELETE CASCADE
	  );

	  -- Create coin history table
	  CREATE TABLE IF NOT EXISTS coin_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		coin_id INTEGER NOT NULL,
		client_id INTEGER NOT NULL,
		timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (coin_id) REFERENCES coins (coin_id),
		FOREIGN KEY (client_id) REFERENCES clients (id)
		);
  
	  CREATE INDEX idx_clients_email ON clients(email);
	  CREATE INDEX idx_transactions_date ON transactions(transaction_date);
	  CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
	  CREATE INDEX idx_transactions_seller ON transactions(seller_id);
	  CREATE INDEX idx_coins_hash ON coins(hash);
	`);
}

/**
 * Create a test user and generate random transactions with seller_id.
 */
function createTestUser(db: Database, usedCombinations: Set<string>): number {
  console.log("👤 Creating test user...");

  const name = "Test";
  const email = "test@test.ts";
  const password = "AAAAA1";
  const phone = "1234567890";
  const address = "123 BitSlow Street";
  const password_hash = bcrypt.hashSync(password, 10);

  const insertClient = db.prepare(`
		INSERT INTO clients (name, email, phone, address, password_hash)
		VALUES (?, ?, ?, ?, ?)
	`);

  try {
    const result = insertClient.run(name, email, phone, address, password_hash);
    const userId = Number(result.lastInsertRowid);
    console.log("✅ Test user created with ID:", userId);

    // Create 5 random clients to use as sellers and buyers
    const clients = seedClients(db, 5);

    // Seed 50 coins for the test user
    const insertCoin = db.prepare(`
			INSERT INTO coins (client_id, bit1, bit2, bit3, value, hash, for_sale)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`);

    const coinIds: number[] = [];
    const usedValues = new Set<number>();

    db.transaction(() => {
      for (let i = 0; i < 50; i++) {
        let bit1: number, bit2: number, bit3: number;
        let comboKey: string;

        do {
          [bit1, bit2, bit3] = generateDistinctRandomValues(3, 1, 10);
          comboKey = `${bit1}-${bit2}-${bit3}`;
        } while (usedCombinations.has(comboKey));

        usedCombinations.add(comboKey);

        let value: number;
        do {
          value = Math.floor(Math.random() * 90_000) + 10_000;
        } while (usedValues.has(value));
        usedValues.add(value);

        // ✅ Now include value like in seedCoins
        const hasher = new CryptoHasher("md5");
        hasher.update(`${bit1}-${bit2}-${bit3}`);
        const hash = hasher.digest("hex");

        const coinResult = insertCoin.run(
          userId,
          bit1,
          bit2,
          bit3,
          value,
          hash,
          0 // for_sale
        );
        coinIds.push(Number(coinResult.lastInsertRowid));
      }
    })();

    console.log("🪙 50 BitSlows created for test user.");

    const insertTx = db.prepare(`
			INSERT INTO transactions (coin_id, seller_id, buyer_id, amount, transaction_date, hash)
			VALUES (?, ?, ?, ?, ?, ?)
		`);

    let txDate = new Date();
    txDate.setMonth(txDate.getMonth() - 3);

    // 💰 Buyer transactions
    db.transaction(() => {
      for (let i = 0; i < 50; i++) {
        const coinId = coinIds[i % coinIds.length];
        const sellerId = clients[Math.floor(Math.random() * clients.length)];
        const coin = db
          .query("SELECT bit1, bit2, bit3, value FROM coins WHERE coin_id = ?")
          .get(coinId) as {
          bit1: number;
          bit2: number;
          bit3: number;
          value: number;
        };

        const minutesToAdd = Math.floor(Math.random() * 1440);
        txDate = new Date(txDate.getTime() + minutesToAdd * 60_000);
        const txDateFormatted = txDate.toISOString().replace("T", " ").substring(0, 19);

        const txHash = computeBitSlow(coin.bit1, coin.bit2, coin.bit3);

        insertTx.run(
          coinId,
          sellerId,
          userId,
          coin.value,
          txDateFormatted,
          txHash
        );
      }
    })();

    console.log("💸 50 transactions created where test user is the buyer.");

    // 💵 Seller transactions
    db.transaction(() => {
      for (let i = 0; i < 50; i++) {
        const coinId = coinIds[i % coinIds.length];
        const buyerId = clients[Math.floor(Math.random() * clients.length)];
        const amount = db
          .query("SELECT value FROM coins WHERE coin_id = ?")
          .get(coinId) as { value: number };

        const minutesToAdd = Math.floor(Math.random() * 1440);
        txDate = new Date(txDate.getTime() + minutesToAdd * 60_000);

        const coin = db
          .query("SELECT bit1, bit2, bit3 FROM coins WHERE coin_id = ?")
          .get(coinId) as { bit1: number; bit2: number; bit3: number };
        const txHash = computeBitSlow(coin.bit1, coin.bit2, coin.bit3);

        const txDateFormatted = txDate.toISOString().replace("T", " ").substring(0, 19);

        insertTx.run(
          coinId,
          userId, // 👈 now test user is seller
          buyerId,
          amount?.value ?? 0,
          txDateFormatted,
          txHash
        );
      }
    })();

    console.log("🧾 50 transactions created where test user is the seller.");

    return userId;
  } catch (err) {
    console.error("⚠️ Failed to create test user (maybe already exists):", err);
    return -1;
  }
}

/**
 * Generate random clients
 */
function seedClients(db: Database, count: number): number[] {
  console.log(`👤 Generating ${count} random clients...`);

  const clientIds: number[] = [];
  const insertClient = db.prepare(`
    INSERT INTO clients (name, email, phone, address, password_hash) 
    VALUES (?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      const phone = faker.phone.number();
      const address = faker.location.streetAddress({ useFullAddress: true });
      const password = faker.internet.password();
      const password_hash = bcrypt.hashSync(password, 10);

      const info = insertClient.run(name, email, phone, address, password_hash);
      clientIds.push(Number(info.lastInsertRowid));
    }
  })();

  return clientIds;
}

/**
 * Generate random BitSlows
 */
export function seedCoins(
  db: Database,
  count: number,
  clientCount: number,
  usedCombinations: Set<string>
): number[] {
  console.log(`💰 Generating ${count} random BitSlows...`);

  const coinIds: number[] = [];
  const insertCoin = db.prepare(`
    INSERT INTO coins (client_id, bit1, bit2, bit3, value, hash, for_sale) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Track used values to ensure each BitSlow has a unique value
  const usedValues = new Set<number>();

  // Track used bit combinations to ensure each (bit1, bit2, bit3) is unique

  db.transaction(() => {
    for (let i = 0; i < count; i++) {
      // About 20% of BitSlows don't have an owner initially
      const clientId =
        Math.random() > 0.2
          ? Math.floor(Math.random() * clientCount) + 1
          : null;

      // Generate unique bit combinations
      let bit1: number, bit2: number, bit3: number;
      let bitCombinationKey: string;

      do {
        const bitValues = generateDistinctRandomValues(3, 1, 10);
        bit1 = bitValues[0];
        bit2 = bitValues[1];
        bit3 = bitValues[2];

        // Create a unique key for this bit combination
        bitCombinationKey = `${bit1}-${bit2}-${bit3}`;
      } while (usedCombinations.has(bitCombinationKey));

      // Add to used bit combinations set
      usedCombinations.add(bitCombinationKey);

      // Generate a unique value between 10,000 and 100,000
      let value: number;
      do {
        value = Math.floor(Math.random() * 90_000) + 10_000;
      } while (usedValues.has(value));

      // Add to used values set
      usedValues.add(value);

      // Generate a unique hash for the coin
      const hasher = new CryptoHasher("md5");
      hasher.update(`${bit1}-${bit2}-${bit3}`);
      const hash = hasher.digest("hex");

      const info = insertCoin.run(clientId, bit1, bit2, bit3, value, hash, 0);
      coinIds.push(Number(info.lastInsertRowid));
    }
  })();

  return coinIds;
}

/**
 * Generate an array of distinct random numbers
 * @param count Number of distinct values to generate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Array of distinct random values
 */
function generateDistinctRandomValues(
  count: number,
  min: number,
  max: number
): number[] {
  if (max - min + 1 < count) {
    throw new Error(
      `Cannot generate ${count} distinct values in range [${min}, ${max}]`
    );
  }

  const values: Set<number> = new Set();
  while (values.size < count) {
    values.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return Array.from(values);
}

/**
 * Generate random transactions
 */
export function seedTransactions(
  db: Database,
  count: number,
  coinCount: number,
  clientCount: number
) {
  console.log(`💸 Generating ${count} realistic transactions...`);

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (coin_id, seller_id, buyer_id, amount, transaction_date, hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const updateCoinOwner = db.prepare(`
    UPDATE coins SET owner_id = ? WHERE coin_id = ?
  `);

  const insertHistory = db.prepare(`
    INSERT INTO coin_history (coin_id, client_id, timestamp)
    VALUES (?, ?, ?)
  `);

  const coinOwners: Record<number, number | null> = {};

  interface Coin {
    bit1: number;
    bit2: number;
    bit3: number;
    value: number;
  }

  let latestTransactionDate = new Date();
  latestTransactionDate.setMonth(latestTransactionDate.getMonth() - 6);

  db.transaction(() => {
    for (let i = 0; i < count; i++) {
      const coinId = Math.floor(Math.random() * coinCount) + 1;
      let sellerId = coinOwners[coinId];

      // Choose a buyer who is NOT the current owner
      let buyerId: number;
      do {
        buyerId = Math.floor(Math.random() * clientCount) + 1;
      } while (buyerId === sellerId);

      const coin = db
        .query("SELECT bit1, bit2, bit3, value FROM coins WHERE coin_id = ?")
        .get(coinId) as Coin;

      const amount = coin?.value || 0;

      const minutesToAdd = Math.floor(Math.random() * 2880) + 1;
      latestTransactionDate = new Date(
        latestTransactionDate.getTime() + minutesToAdd * 60000
      );

      // 🔐 Use shared computeBitSlow for consistency
      const hash = computeBitSlow(coin.bit1, coin.bit2, coin.bit3);
      const txDateFormatted = latestTransactionDate.toISOString().replace("T", " ").substring(0, 19);


      // If it's the first transaction, generate a random seller
      if (!sellerId) {
        do {
          sellerId = Math.floor(Math.random() * clientCount) + 1;
        } while (sellerId === buyerId);
      }

      insertTransaction.run(
        coinId,
        sellerId,
        buyerId,
        amount.toFixed(2),
        txDateFormatted,
        hash
      );

      // Log coin ownership change
      updateCoinOwner.run(buyerId, coinId);
      insertHistory.run(coinId, buyerId, txDateFormatted);

      coinOwners[coinId] = buyerId;
    }
  })();

  console.log("✅ Transactions generated with realistic buyers, sellers, and ownership history.");
}

