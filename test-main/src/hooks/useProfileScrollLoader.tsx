import { useRef, useState } from "react";
import { ProfileStats } from "@/types/profile";

const ENDPOINT_URL = "http://localhost:3000/";

export function useProfileScrollLoader(
  profile: ProfileStats | null,
  setProfile: React.Dispatch<React.SetStateAction<ProfileStats | null>>,
  limit = 10
) {
  const [coinPage, setCoinPage] = useState(1);
  const [buyerTxPage, setBuyerTxPage] = useState(1);
  const [sellerTxPage, setSellerTxPage] = useState(1);

  const [loadingMoreCoins, setLoadingMoreCoins] = useState(false);
  const [loadingMoreBuyerTxs, setLoadingMoreBuyerTxs] = useState(false);
  const [loadingMoreSellerTxs, setLoadingMoreSellerTxs] = useState(false);

  const [hasMoreCoins, setHasMoreCoins] = useState(true);
  const [hasMoreBuyerTxs, setHasMoreBuyerTxs] = useState(true);
  const [hasMoreSellerTxs, setHasMoreSellerTxs] = useState(true);

  const coinsLoadingRef = useRef(false);
  const buyerTxsLoadingRef = useRef(false);
  const sellerTxsLoadingRef = useRef(false);

  const fetchMoreCoins = async () => {
    if (coinsLoadingRef.current || !hasMoreCoins) return;
    coinsLoadingRef.current = true;
    setLoadingMoreCoins(true);

    try {
      const nextPage = coinPage + 1;
      const res = await fetch(
        `${ENDPOINT_URL}api/profile?type=coins&page=${nextPage}&limit=${limit}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch more coins");

      const data = await res.json();
      setCoinPage(nextPage);
      setHasMoreCoins(data.coins.length === limit);

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              client: {
                ...prev.client,
                coins: [...(prev.client.coins || []), ...data.coins],
              },
            }
          : prev
      );
    } catch (err) {
      console.error("Error loading more coins:", err);
    } finally {
      coinsLoadingRef.current = false;
      setLoadingMoreCoins(false);
    }
  };

  const fetchMoreBuyerTransactions = async () => {
    if (buyerTxsLoadingRef.current || !hasMoreBuyerTxs) return;
    buyerTxsLoadingRef.current = true;
    setLoadingMoreBuyerTxs(true);

    try {
      const nextPage = buyerTxPage + 1;
      const res = await fetch(
        `${ENDPOINT_URL}api/profile?type=transactions&subtype=buyer&page=${nextPage}&limit=${limit}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch buyer transactions");

      const data = await res.json();
      setBuyerTxPage(nextPage);
      setHasMoreBuyerTxs(data.buyerTransactions.length === limit);

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              client: {
                ...prev.client,
                clientTransactions: [
                  ...(prev.client.clientTransactions || []),
                  ...data.buyerTransactions,
                ],
              },
            }
          : prev
      );
    } catch (err) {
      console.error("Error loading buyer txs:", err);
    } finally {
      buyerTxsLoadingRef.current = false;
      setLoadingMoreBuyerTxs(false);
    }
  };

  const fetchMoreSellerTransactions = async () => {
    if (sellerTxsLoadingRef.current || !hasMoreSellerTxs) return;
    sellerTxsLoadingRef.current = true;
    setLoadingMoreSellerTxs(true);

    try {
      const nextPage = sellerTxPage + 1;
      const res = await fetch(
        `${ENDPOINT_URL}api/profile?type=transactions&subtype=seller&page=${nextPage}&limit=${limit}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch seller transactions");

      const data = await res.json();
      setSellerTxPage(nextPage);
      setHasMoreSellerTxs(data.sellerTransactions.length === limit);

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              client: {
                ...prev.client,
                sellerTransactions: [
                  ...(prev.client.sellerTransactions || []),
                  ...data.sellerTransactions,
                ],
              },
            }
          : prev
      );
    } catch (err) {
      console.error("Error loading seller txs:", err);
    } finally {
      sellerTxsLoadingRef.current = false;
      setLoadingMoreSellerTxs(false);
    }
  };

  return {
    fetchMoreCoins,
    loadingMoreCoins,
    hasMoreCoins,

    fetchMoreBuyerTransactions,
    loadingMoreBuyerTxs,
    hasMoreBuyerTxs,

    fetchMoreSellerTransactions,
    loadingMoreSellerTxs,
    hasMoreSellerTxs,
  };
}
