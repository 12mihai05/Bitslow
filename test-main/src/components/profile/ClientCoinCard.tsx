import { Coin } from "@/types/coin";

interface CoinCardProps {
  coin: Coin;
  onToggleListing: (
    coinId: number,
    action: "list" | "unlist"
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
}

function ClientCoinCard({ coin, onToggleListing }: CoinCardProps) {
  return (
    <div className="min-w-[280px] bg-white/80 border border-gray-100 rounded-xl shadow hover:shadow-md transition-all p-5 flex-shrink-0 flex flex-col justify-between relative backdrop-blur-sm hover:border-gray-300">
      <div className="absolute top-3 right-3 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-medium">
        #{coin.coin_id}
      </div>

      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900">BitSlow Coin</h3>
        <p className="text-xs text-gray-500">Created: {coin.created_at}</p>
      </div>

      <div className="bg-gray-100 rounded-lg px-3 py-2 mb-3">
        <p className="text-[11px] text-gray-400 uppercase mb-1 font-medium">
          Hash
        </p>
        <p className=" font-mono text-gray-800 break-words text-sm leading-5">
          {coin.hash}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-3">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">Bits</p>
          <p className="font-semibold">
            {coin.bit1}, {coin.bit2}, {coin.bit3}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase mb-1">Value</p>
          <p className="font-bold text-green-600">
            ${coin.value.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <span className="text-xs text-gray-400 uppercase">Owner:</span>{" "}
        {coin.owner || "Unowned"}
      </div>

      {coin.for_sale ? (
        <button
          onClick={() => onToggleListing(coin.coin_id, "unlist")}
          className="w-full bg-yellow-50 text-yellow-700 border border-yellow-200 text-sm py-2 rounded-md hover:bg-yellow-100 transition cursor-pointer"
        >
          Listed on Market
        </button>
      ) : (
        <button
          onClick={() => onToggleListing(coin.coin_id, "list")}
          className="w-full bg-gray-900 text-white text-sm py-2 rounded-md hover:bg-gray-800 transition cursor-pointer"
        >
          List on Market
        </button>
      )}
    </div>
  );
}

export default ClientCoinCard;
