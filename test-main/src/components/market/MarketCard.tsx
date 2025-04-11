import type { Coin } from "@/types/coin";

interface CoinCardProps {
  coin: Coin;
  currentUserId: number | null;
  onHistoryClick: (coinId: number) => void;
  onUnlist: (coinId: number) => Promise<void>;
  onBuy: (coinId: number) => void;
}

export default function CoinCard({
  coin,
  currentUserId,
  onHistoryClick,
  onUnlist,
  onBuy,
}: CoinCardProps) {
  return (
    <div
      id={`coin-${coin.coin_id}`}
      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group hover:border-gray-300"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800">
          BitSlow #{coin.coin_id}
        </h2>
        <span className="text-sm text-gray-500 group-hover:text-blue-500 transition">
          {new Date(coin.created_at + "Z").toLocaleDateString()}
        </span>
      </div>

      <div className="bg-gray-100 rounded-lg p-3 mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Hash</p>
        <p className="text-sm font-mono text-gray-800 break-all">{coin.hash}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-3">
        <div>
          <p className="text-gray-400 text-xs uppercase">Bits</p>
          <p className="font-semibold">
            {coin.bit1}, {coin.bit2}, {coin.bit3}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-xs uppercase text-right">Value</p>
          <p className="font-semibold text-green-600 text-right">
            ${coin.value.toLocaleString()}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400 text-xs uppercase">Owner</p>
          <p className="font-medium">{coin.owner || "Unowned"}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onHistoryClick(coin.coin_id)}
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm px-4 py-2 rounded transition-all shadow-sm border border-gray-300 cursor-pointer"
        >
          History
        </button>

        {coin.client_id === currentUserId ? (
          <button
            onClick={() => onUnlist(coin.coin_id)}
            className="bg-yellow-100 text-yellow-800 text-sm px-4 py-2 rounded hover:bg-yellow-200 transition shadow cursor-pointer"
          >
            Unlist
          </button>
        ) : (
          <button
            onClick={() => onBuy(coin.coin_id)}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded transition-all shadow-md cursor-pointer"
          >
            Buy
          </button>
        )}
      </div>
    </div>
  );
}
