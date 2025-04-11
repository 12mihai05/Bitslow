import { useState, useEffect, useRef } from "react";
import type { Coin } from "@/types/coin";
import type { MarketQuery } from "@/types/market-query";
import { useProfile } from "./useProfile";

const ENDPOINT_URL = "http://localhost:3000/api/market";

type CachedData = {
  coins: Coin[];
  total: number;
};

export function useMarket(query: MarketQuery) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [canGenerate, setCanGenerate] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const cache = useRef<Map<string, CachedData>>(new Map());

  const { toggleListing } = useProfile();

  useEffect(() => {
    if (query.page) sessionStorage.setItem("market_page", String(query.page));
    if (query.limit)
      sessionStorage.setItem("market_limit", String(query.limit));
  }, [query.page, query.limit]);

  const persistedPage = Number(sessionStorage.getItem("market_page") || "1");
  const persistedLimit = Number(sessionStorage.getItem("market_limit") || "30");

  const buildParams = (q: MarketQuery): string => {
    const params = new URLSearchParams();
    params.set("page", String(q.page ?? persistedPage));
    params.set("limit", String(q.limit ?? persistedLimit));
    return params.toString();
  };

  const fetchData = async (
    signal?: AbortSignal,
    useLoading = true,
    force = false
  ) => {
    const currentKey = buildParams(query);

    if (!force && cache.current.has(currentKey)) {
      const cached = cache.current.get(currentKey)!;
      setCoins(cached.coins);
      setTotal(cached.total);
      if (useLoading) setLoading(false);
      return;
    }

    if (useLoading) setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${ENDPOINT_URL}?${currentKey}`, {
        credentials: "include",
        signal,
      });

      if (!res.ok) throw new Error("Failed to fetch market coins");

      const data = await res.json();

      if (!signal?.aborted) {
        const cachedData = {
          coins: data.coins || [],
          total: data.total || 0,
        };
        cache.current.set(currentKey, cachedData);
        setCoins(cachedData.coins);
        setTotal(cachedData.total);

        if (data.userId !== undefined) {
          setCurrentUserId(data.userId);
        }

        // ✅ Prefetch next page in background
        const page = query.page ?? persistedPage;
        const limit = query.limit ?? persistedLimit;
        const nextQuery = { ...query, page: page + 1 };
        const nextKey = buildParams(nextQuery);

        if (!cache.current.has(nextKey)) {
          fetch(`${ENDPOINT_URL}?${nextKey}`, {
            credentials: "include",
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((nextData) => {
              if (nextData?.coins) {
                const nextCached: CachedData = {
                  coins: nextData.coins || [],
                  total: nextData.total || 0,
                };
                cache.current.set(nextKey, nextCached);
              }
            })
            .catch(() => {});
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
    fetchData(controller.signal);
    return () => controller.abort();
  }, [query.page, query.limit]);

  const generateCoin = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const res = await fetch(ENDPOINT_URL, {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 409) {
        const err = await res.json().catch(() => null);
        setCanGenerate(false);
        return {
          success: false,
          error: err?.error || "No unique coin combinations left",
        };
      }

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Failed to generate BitSlow");
      }

      const newCoin: Coin = await res.json();
      cache.current.clear();
      setTotal((prev) => prev + 1);

      const controller = new AbortController();
      abortRef.current = controller;
      await fetchData(controller.signal, true, true);

      return { success: true };
    } catch (err: any) {
      console.error("Coin generation failed:", err);
      return { success: false, error: err.message };
    }
  };

  const buyCoin = async (
    coinId: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${ENDPOINT_URL}/buy`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coin_id: coinId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || "Failed to buy coin");
      }

      const page = query.page ?? persistedPage;
      const limit = query.limit ?? persistedLimit;
      const currentKey = buildParams(query);

      const currentCoins = coins.filter((c) => c.coin_id !== coinId);

      let mergedCoins = [...currentCoins];

      const nextQuery = { ...query, page: page + 1 };
      const nextKey = buildParams(nextQuery);
      const nextCache = cache.current.get(nextKey);

      if (
        currentCoins.length < limit &&
        nextCache &&
        nextCache.coins.length > 0
      ) {
        const fillerCount = limit - currentCoins.length;
        const fillerCoins = nextCache.coins.slice(0, fillerCount);
        mergedCoins = [...currentCoins, ...fillerCoins];

        const remainingNextCoins = nextCache.coins.slice(fillerCount);
        if (remainingNextCoins.length === 0) {
          cache.current.delete(nextKey);
        } else {
          cache.current.set(nextKey, {
            coins: remainingNextCoins,
            total: remainingNextCoins.length,
          });
        }
      }

      setCoins(mergedCoins);
      cache.current.set(currentKey, {
        coins: mergedCoins,
        total: mergedCoins.length,
      });

      let newTotal = 0;
      for (const { coins } of cache.current.values()) {
        newTotal += coins.length;
      }
      setTotal((prev) => Math.max(prev - 1, 0));

      return { success: true };
    } catch (err: any) {
      console.error("Buy failed:", err);
      return { success: false, error: err.message };
    }
  };

  const unlistCoin = async (
    coinId: number
  ): Promise<{ success: boolean; error?: string }> => {
    if (!toggleListing)
      return { success: false, error: "No toggleListing provided." };

    const res = await toggleListing(coinId, "unlist");
    if (!res.success) return { success: false, error: res.message };

    const page = query.page ?? persistedPage;
    const limit = query.limit ?? persistedLimit;
    const currentKey = buildParams(query);
    const updatedTotal = Math.max(total - 1, 0);

    const currentCoins = coins.filter((c) => c.coin_id !== coinId);

    let mergedCoins = [...currentCoins];

    const nextQuery = { ...query, page: page + 1 };
    const nextKey = buildParams(nextQuery);
    const nextCache = cache.current.get(nextKey);

    if (
      currentCoins.length < limit &&
      nextCache &&
      nextCache.coins.length > 0
    ) {
      const fillerCount = limit - currentCoins.length;
      const fillerCoins = nextCache.coins.slice(0, fillerCount);
      mergedCoins = [...currentCoins, ...fillerCoins];

      const remainingNextCoins = nextCache.coins.slice(fillerCount);
      if (remainingNextCoins.length === 0) {
        cache.current.delete(nextKey);
      } else {
        cache.current.set(nextKey, {
          coins: remainingNextCoins,
          total: remainingNextCoins.length,
        });
      }
    }

    setCoins(mergedCoins);
    cache.current.set(currentKey, {
      coins: mergedCoins,
      total: mergedCoins.length,
    });

    setTotal(updatedTotal);

    return { success: true };
  };

  const refetchMarket = () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    fetchData(controller.signal, true, true);
  };

  return {
    coins,
    total,
    currentUserId,
    loading,
    error,
    canGenerate,
    refetchMarket,
    generateCoin,
    buyCoin,
    toggleListing,
    unlistCoin,
    clearCache: () => cache.current.clear(),
  };
}
