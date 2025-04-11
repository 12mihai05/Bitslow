import { useEffect, useState } from "react";

interface HistoryEntry {
  client_id: number;
  client_name: string;
  timestamp: string;
}

export function useCoinHistory(coinId: number | null) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinId) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/coin-history?coin_id=${coinId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        setHistory(data.history || []);
      } catch (err: any) {
        setError(err.message || "Error loading history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [coinId]);

  return { history, loading, error };
}
