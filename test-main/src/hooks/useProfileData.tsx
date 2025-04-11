import { useEffect, useState } from "react";
import { ProfileStats } from "@/types/profile";

const ENDPOINT_URL = "http://localhost:3000/";

export function useProfileData(limit = 10) {
  const [profile, setProfile] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [transactionCounts, setTransactionCounts] = useState({
    total: 0,
    totalBuyer: 0,
    totalSeller: 0,
  });

  const [hasMoreCoins, setHasMoreCoins] = useState(true);
  const [hasMoreBuyerTxs, setHasMoreBuyerTxs] = useState(true);
  const [hasMoreSellerTxs, setHasMoreSellerTxs] = useState(true);

  useEffect(() => {
    const fetchInitialProfile = async () => {
      try {
        const res = await fetch(`${ENDPOINT_URL}api/profile?limit=${limit}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch profile data");

        const data = await res.json();

        setProfile(data);
        setTransactionCounts({
          total: data.transactions?.total || 0,
          totalBuyer: data.transactions?.buyer || 0,
          totalSeller: data.transactions?.seller || 0,
        });

        setHasMoreCoins(data?.client?.coins?.length === limit);
        setHasMoreBuyerTxs(data?.client?.clientTransactions?.length === limit);
        setHasMoreSellerTxs(data?.client?.sellerTransactions?.length === limit);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProfile();
  }, [limit]);

  return {
    profile,
    setProfile,
    loading,
    error,
    transactionCounts,
    hasMoreCoins,
    hasMoreBuyerTxs,
    hasMoreSellerTxs,
  };
}
