import React, { useRef } from "react";
import { Coin } from "@/types/coin";
import { useProfile } from "@/hooks/useProfile";
import ClientOverviewSkeleton from "../loaders/ClientOverviewSkeleton";
import CoinCard from "../market/MarketCard";
import ClientCoinCard from "./ClientCoinCard";
import TransactionCard from "./ClientTransactionCard";

export function ClientOverview() {
  const {
    profile,
    fetchMoreCoins,
    fetchMoreBuyerTransactions,
    fetchMoreSellerTransactions,
    loadingMoreCoins,
    loadingMoreBuyerTxs,
    loadingMoreSellerTxs,
    toggleListing,
  } = useProfile();

  const coinScrollRef = useRef<HTMLDivElement>(null);
  const buyerTxScrollRef = useRef<HTMLDivElement>(null);
  const sellerTxScrollRef = useRef<HTMLDivElement>(null);

  const client = profile?.client;
  const coins: Coin[] = client?.coins || [];
  const buyerTxs = client?.clientTransactions || [];
  const sellerTxs = client?.sellerTransactions || [];

  const handleScrollFetch = (
    ref: React.RefObject<HTMLDivElement | null>,
    fetchFn: () => void
  ) => {
    const node = ref.current;
    if (!node) return;

    const ELEMENT_WIDTH = 315;
    const GAP_WIDTH = 16;
    const FULL_WIDTH = ELEMENT_WIDTH + GAP_WIDTH;

    if (
      node.scrollLeft + node.clientWidth >=
      node.scrollWidth - FULL_WIDTH * 3
    ) {
      fetchFn();
    }
  };

  const renderLoader = () => (
    <div className="min-w-[250px] flex items-center justify-center h-16 self-center">
      <div className="flex space-x-3">
        <span className="w-3 h-3 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-3 h-3 bg-gray-800 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-3 h-3 bg-gray-800 rounded-full animate-bounce"></span>
      </div>
    </div>
  );

  return !profile?.client ? (
    <ClientOverviewSkeleton />
  ) : (
    <>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Owned BitSlows
        </h2>
        <div
          className="flex gap-4 overflow-x-auto pb-2"
          ref={coinScrollRef}
          onScroll={() => handleScrollFetch(coinScrollRef, fetchMoreCoins)}
        >
          {coins.map((coin, index) => (
            <ClientCoinCard
              key={`${coin.coin_id}-${index}`}
              coin={coin}
              onToggleListing={toggleListing}
            />
          ))}

          {loadingMoreCoins && renderLoader()}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Transactions
        </h2>

        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-700 mb-2">As Buyer</h3>
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            ref={buyerTxScrollRef}
            onScroll={() =>
              handleScrollFetch(buyerTxScrollRef, fetchMoreBuyerTransactions)
            }
          >
            {buyerTxs.map((tx, index) => (
              <TransactionCard
                key={`buyer-${tx.id}-${index}`}
                tx={tx}
                type="buyer"
              />
            ))}

            {loadingMoreBuyerTxs && renderLoader()}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">As Seller</h3>
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            ref={sellerTxScrollRef}
            onScroll={() =>
              handleScrollFetch(sellerTxScrollRef, fetchMoreSellerTransactions)
            }
          >
            {sellerTxs.map((tx, index) => (
              <TransactionCard
                key={`seller-${tx.id}-${index}`}
                tx={tx}
                type="seller"
              />
            ))}

            {loadingMoreSellerTxs && renderLoader()}
          </div>
        </div>
      </section>
    </>
  );
}
