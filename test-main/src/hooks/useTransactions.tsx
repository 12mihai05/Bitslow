import { useState, useEffect, useRef } from "react";
import { Transaction } from "@/types/transaction";
import { TransactionQuery } from "@/types/transaction-querries";

const ENDPOINT_URL = "http://localhost:3000/api";

type CachedData = {
  transactions: Transaction[];
  total: number;
};

export function useTransactions(query: TransactionQuery) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const cache = useRef<Map<string, CachedData>>(new Map());

  const persistedPage = Number(
    sessionStorage.getItem("transactions_page") || "1"
  );
  const persistedLimit = Number(
    sessionStorage.getItem("transactions_limit") || "30"
  );

  useEffect(() => {
    if (query.page)
      sessionStorage.setItem("transactions_page", String(query.page));
    if (query.limit)
      sessionStorage.setItem("transactions_limit", String(query.limit));
  }, [query.page, query.limit]);

  const buildQueryString = (q: TransactionQuery): string => {
    const params = new URLSearchParams();

    params.set("page", String(q.page ?? persistedPage));
    params.set("limit", String(q.limit ?? persistedLimit));

    if (q.buyer) params.set("buyer", q.buyer);
    if (q.seller) params.set("seller", q.seller);
    if (q.minValue !== undefined) params.set("minValue", q.minValue.toString());
    if (q.maxValue !== undefined) params.set("maxValue", q.maxValue.toString());
    if (q.startDate) params.set("startDate", q.startDate);
    if (q.endDate) params.set("endDate", q.endDate);
    if (q.sortBy) params.set("sortBy", q.sortBy);
    if (q.sortOrder) params.set("sortOrder", q.sortOrder);

    return params.toString();
  };

  const fetchTransactions = async (
    signal?: AbortSignal,
    useLoading = true,
    force = false,
    customQuery?: TransactionQuery
  ) => {
    const q = customQuery ?? query;
    const currentKey = buildQueryString(q);

    if (!force && cache.current.has(currentKey)) {
      const cached = cache.current.get(currentKey)!;
      setTransactions(cached.transactions);
      setTotal(cached.total);
      if (useLoading) setLoading(false);
      return;
    }

    if (useLoading) setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${ENDPOINT_URL}/transactions?${currentKey}`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) throw new Error("Failed to fetch transactions");

      const data = await res.json();

      if (
        !signal?.aborted &&
        (!customQuery || JSON.stringify(customQuery) === JSON.stringify(query))
      ) {
        setTransactions(data.transactions);
        setTotal(data.total);

        if (q.page && data.transactions.length > 0) {
          const nextPageQuery = { ...q, page: q.page + 1 };
          const nextKey = buildQueryString(nextPageQuery);

          if (
            !cache.current.has(nextKey) &&
            !sessionStorage.getItem(`tx_cache_${nextKey}`)
          ) {
            fetch(`${ENDPOINT_URL}/transactions?${nextKey}`, {
              credentials: "include",
            })
              .then((res) =>
                res.ok ? res.json() : Promise.reject("Prefetch failed")
              )
              .then((data) => {
                const nextData = {
                  transactions: data.transactions || [],
                  total: data.total || 0,
                };
                cache.current.set(nextKey, nextData);
                sessionStorage.setItem(
                  `tx_cache_${nextKey}`,
                  JSON.stringify(nextData)
                );
              });
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err);
      }
    } finally {
      if (!signal?.aborted && useLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    fetchTransactions(controller.signal);

    return () => controller.abort();
  }, [JSON.stringify(query)]);

  useEffect(() => {
    if (!query.page || total === 0) return;

    const nextPage = query.page + 1;
    const nextQuery = { ...query, page: nextPage };
    const nextKey = buildQueryString(nextQuery);

    if (
      cache.current.has(nextKey) ||
      sessionStorage.getItem(`tx_cache_${nextKey}`)
    ) {
      return;
    }

    fetch(`${ENDPOINT_URL}/transactions?${nextKey}`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Prefetch failed")))
      .then((data) => {
        const nextData = {
          transactions: data.transactions || [],
          total: data.total || 0,
        };
        cache.current.set(nextKey, nextData);
        sessionStorage.setItem(`tx_cache_${nextKey}`, JSON.stringify(nextData));
      })
      .catch(() => {});
  }, [query.page, total]);

  const refetchTransactions = () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    fetchTransactions(controller.signal, true, true);
  };

  return {
    transactions,
    total,
    loading,
    error,
    refetchTransactions,
  };
}
