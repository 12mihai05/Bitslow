import { useEffect, useState } from "react";
import { useMarket } from "@/hooks/useMarket";
import type { Coin } from "@/types/coin";
import PaginationControls from "@/components/PaginationControls";
import MarketSkeleton from "../components/loaders/MarketSkeleton";
import { useProfile } from "@/hooks/useProfile";
import EmptyState from "@/components/EmptyState";
import GenerateCoinButton from "@/components/market/GenerateCoinButton";
import ErrorMessage from "@/components/ErrorMessage";
import MarketCard from "../components/market/MarketCard";
import HistoryModal from "../components/market/MarketModal";

export default function Market() {
  const [page, setPage] = useState(() =>
    Number(sessionStorage.getItem("market_page") || 1)
  );
  const [limit, setLimit] = useState(() =>
    Number(sessionStorage.getItem("market_limit") || 30)
  );

  const {
    coins,
    total,
    loading,
    error,
    generateCoin,
    buyCoin,
    canGenerate,
    currentUserId,
    refetchMarket,
    unlistCoin,
    clearCache,
  } = useMarket({
    page,
    limit,
  });

  const [selectedCoinId, setSelectedCoinId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [hasBouncedBack, setHasBouncedBack] = useState(false);

  const openHistoryModal = (coinId: number) => {
    setSelectedCoinId(coinId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCoinId(null);
  };

  useEffect(() => {
    if (!loading && coins.length === 0 && page > 1 && !hasBouncedBack) {
      setHasBouncedBack(true);
      setPage((prev) => prev - 1);
    }

    if (!loading && coins.length > 0 && hasBouncedBack) {
      setHasBouncedBack(false);
    }
  }, [coins, loading, page, hasBouncedBack]);

  useEffect(() => {
    if (!loading) {
      refetchMarket();
    }
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto p-4 pt-16 mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        BitSlow Marketplace
      </h1>

      {page === 1 &&
        canGenerate &&
        (total === 1000 ? null : (
          <GenerateCoinButton generateCoin={generateCoin} />
        ))}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MarketSkeleton count={limit} />
        </div>
      ) : error ? (
        <ErrorMessage message="Error fetching coins." statusCode={400} />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coins.length === 0 ? (
              <div className="col-span-full text-center py-10 text-gray-500">
                <EmptyState
                  icon={"🔎"}
                  title={"No BitSlows Available"}
                  message={"Try generating a new BitSlow or come back later."}
                />
              </div>
            ) : (
              coins.map((coin: Coin) => (
                <MarketCard
                  key={coin.coin_id}
                  coin={coin}
                  currentUserId={currentUserId}
                  onHistoryClick={openHistoryModal}
                  onUnlist={async (coinId) => {
                    const result = await unlistCoin(coinId);
                    if (!result.success) {
                      console.error(result.error || "Failed to unlist coin.");
                    }
                  }}
                  onBuy={buyCoin}
                />
              ))
            )}
          </div>

          {coins.length > 0 && (
            <PaginationControls
              page={page}
              limit={limit}
              total={total}
              onPageChange={(pg) => setPage(pg)}
              onLimitChange={(lmt) => {
                setLimit(lmt);
                setPage(1);
              }}
            />
          )}
        </>
      )}

      {showModal && (
        <HistoryModal
          coinId={selectedCoinId}
          show={showModal}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
