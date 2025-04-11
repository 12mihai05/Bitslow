import { PublicTransaction } from "@/types/transaction";

type TransactionCardProps = {
    tx: PublicTransaction;
    type: "buyer" | "seller";
  };

function TransactionCard({ tx, type }: TransactionCardProps) {
  const badgeColor =
    type === "buyer"
      ? "bg-blue-100 text-blue-600"
      : "bg-yellow-100 text-yellow-600";

  return (
    <div className="min-w-[280px] bg-white/80 border border-gray-100 rounded-xl shadow hover:shadow-md transition-all p-5 flex-shrink-0 flex flex-col justify-between relative backdrop-blur-sm hover:border-gray-300">
      <div
        className={`absolute top-3 right-3 ${badgeColor} text-xs px-2 py-0.5 rounded-full font-medium`}
      >
        #{tx.id}
      </div>

      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Transaction</h3>
        <p className="text-xs text-gray-500">
          {new Date(tx.transaction_date).toLocaleDateString()}
        </p>
      </div>

      <div className="bg-gray-100 rounded-lg px-3 py-2 mb-3">
        <p className="text-[11px] text-gray-400 uppercase mb-1 font-medium">
          Hash
        </p>
        <p className="text-[13px] font-mono text-gray-800 break-words">
          {tx.hash}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-3">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">From</p>
          <p className="font-semibold">
            {tx.seller_name || (type === "buyer" ? "System" : "You")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase mb-1">To</p>
          <p className="font-semibold">
            {tx.buyer_name || "Unknown"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-1">Bits</p>
          <p>
            {tx.bit1}, {tx.bit2}, {tx.bit3}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase mb-1">Amount</p>
          <p className="font-bold text-green-600">
            ${tx.amount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TransactionCard;
