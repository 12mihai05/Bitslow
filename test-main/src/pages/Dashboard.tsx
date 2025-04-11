import { useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import ErrorMessage from "@/components/ErrorMessage";
import TransactionFilters from "../components/dashboard/TransactionFilters";
import PaginationControls from "../components/PaginationControls";
import TransactionSkeleton from "../components/loaders/TransactionSkeleton";
import EmptyState from "../components/EmptyState";

type SortDirection = "asc" | "desc" | null;

export default function Dashboard() {
  const [page, setPage] = useState(() =>
    Number(sessionStorage.getItem("transactions_page") || 1)
  );
  const [limit, setLimit] = useState(() =>
    Number(sessionStorage.getItem("transactions_limit") || 30)
  );

  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortDirection>(null);

  const { transactions, total, loading, error, refetchTransactions } =
    useTransactions({
      page,
      limit,
      ...filters,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    });
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") {
        setSortBy(null);
        setSortOrder(null);
      } else {
        setSortOrder("asc");
      }
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }

    setPage(1);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    if (sortOrder === "asc") return <span className="ml-1">▲</span>;
    if (sortOrder === "desc") return <span className="ml-1">▼</span>;
    return null;
  };

  useEffect(() => {
    const totalPages = Math.ceil(total / limit);
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [total, page, limit]);

  if (error && !loading) {
    return (
      <ErrorMessage
        statusCode={500}
        title="Unable to Load Transactions"
        message={error.message || "Transaction data not found or unavailable."}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 pt-16 mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        BitSlow Transactions
      </h1>

      <div className="flex justify-between items-center mb-4 w-full">
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="p-2 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="3 4 21 4 14 12 14 19 10 21 10 12 3 4"></polygon>
          </svg>
        </button>

        <button
          onClick={refetchTransactions}
          disabled={loading}
          className={`p-2 rounded-full border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition ${
            loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            viewBox="0 0 30 30"
            fill="currentColor"
          >
            <path d="M 15 3 C 12.031398 3 9.3028202 4.0834384 7.2070312 5.875 A 1.0001 1.0001 0 1 0 8.5058594 7.3945312 C 10.25407 5.9000929 12.516602 5 15 5 C 20.19656 5 24.450989 8.9379267 24.951172 14 L 22 14 L 26 20 L 30 14 L 26.949219 14 C 26.437925 7.8516588 21.277839 3 15 3 z M 4 10 L 0 16 L 3.0507812 16 C 3.562075 22.148341 8.7221607 27 15 27 C 17.968602 27 20.69718 25.916562 22.792969 24.125 A 1.0001 1.0001 0 1 0 21.494141 22.605469 C 19.74593 24.099907 17.483398 25 15 25 C 9.80344 25 5.5490109 21.062074 5.0488281 16 L 8 16 L 4 10 z"></path>
          </svg>
        </button>
      </div>

      <div
        className={`transition-all duration-500 overflow-hidden ${
          showFilters ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <TransactionFilters
          onChange={(newFilters) => {
            setFilters(newFilters);
            setPage(1);
          }}
          onReset={() => {
            setFilters({});
            setPage(1);
          }}
          onClose={() => setShowFilters(false)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full border-collapse bg-white text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th
                onClick={() => handleSort("id")}
                className="cursor-pointer p-4 text-left whitespace-nowrap hover:bg-gray-900"
              >
                ID {renderSortIcon("id")}
              </th>
              <th
                onClick={() => handleSort("hash")}
                className="cursor-pointer p-4 text-left whitespace-nowrap hover:bg-gray-900"
              >
                BitSlow {renderSortIcon("hash")}
              </th>
              <th
                onClick={() => handleSort("seller_name")}
                className="cursor-pointer p-4 text-left whitespace-nowrap hover:bg-gray-900"
              >
                Seller {renderSortIcon("seller_name")}
              </th>
              <th
                onClick={() => handleSort("buyer_name")}
                className="cursor-pointer p-4 text-left whitespace-nowrap hover:bg-gray-900"
              >
                Buyer {renderSortIcon("buyer_name")}
              </th>
              <th
                onClick={() => handleSort("amount")}
                className="cursor-pointer p-4 text-right whitespace-nowrap hover:bg-gray-900"
              >
                Amount {renderSortIcon("amount")}
              </th>
              <th
                onClick={() => handleSort("transaction_date")}
                className="cursor-pointer p-4 text-left whitespace-nowrap hover:bg-gray-900"
              >
                Date {renderSortIcon("transaction_date")}
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TransactionSkeleton rows={limit} />
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon="🔎"
                    title="No Transactions Found"
                    message="Try adjusting your filters or refreshing the page."
                  />
                </td>
              </tr>
            ) : (
              transactions.map((tx, index) => (
                <tr
                  key={tx.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index === transactions.length - 1
                      ? ""
                      : "border-b border-gray-200"
                  }`}
                >
                  <td className="p-4 text-gray-600">{tx.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-gray-800">{tx.hash}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Bits: {tx.bit1}, {tx.bit2}, {tx.bit3}
                      </div>
                      <div className="text-xs text-gray-500">
                        Value: ${tx.value.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">
                    {tx.seller_name || <hr className="w-[40%]" />}
                  </td>
                  <td className="p-4 text-gray-700">{tx.buyer_name}</td>
                  <td className="p-4 text-right font-semibold text-gray-800">
                    ${tx.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(tx.transaction_date + "Z").toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <PaginationControls
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
}