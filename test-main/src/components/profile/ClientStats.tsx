import { useProfile } from "@/hooks/useProfile";
import SkeletonClientStats from "../loaders/ClientStatsSkeleton";

export function ClientStats() {
  const { profile, transactionCounts } = useProfile();

  return !profile?.client ? (
    <SkeletonClientStats />
  ) : (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Transactions
        </h2>
        <div className="flex items-center justify-between text-blue-600 text-xl font-bold">
          <div className="flex flex-col items-center">
            <span className="text-base font-medium text-gray-600">Bought</span>
            <span className="text-3xl">
              {transactionCounts.totalBuyer ?? 0}
            </span>
          </div>
          <div className="w-px h-10 bg-gray-300 mx-6" />
          <div className="flex flex-col items-center">
            <span className="text-base font-medium text-gray-600">Sold</span>
            <span className="text-3xl">
              {transactionCounts.totalSeller ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          BitSlow Coins
        </h2>
        <p className="text-3xl font-bold text-blue-600">
          {profile?.coinsOwned ?? 0}
        </p>
      </div>

      <div className="bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Total Value
        </h2>
        <p className="text-3xl font-bold text-green-600">
          ${profile?.totalValue.toLocaleString() ?? 0}
        </p>
      </div>
    </div>
  );
}

