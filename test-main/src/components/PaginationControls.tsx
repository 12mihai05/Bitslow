import { useEffect, useState } from "react";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function PaginationControls({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const [isMobile, setIsMobile] = useState(false);

  const limits = [18, 30, 50];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");

    const handleResize = () => setIsMobile(mediaQuery.matches);
    handleResize();

    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const getPageNumbers = (): (number | "...")[] => {
    const delta = isMobile ? 1 : 2;
    const range: (number | "...")[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);

    if (left > 2) {
      range.push("...");
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) {
      range.push("...");
    }

    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
      <div>
        <label htmlFor="page-limit" className="mr-2 text-sm text-gray-700">
          Items per page:
        </label>
        <select
          id="page-limit"
          value={limit}
          onChange={(e) => {
            onLimitChange(parseInt(e.target.value));
            onPageChange(1);
          }}
          className="border border-gray-300 rounded p-1 cursor-pointer text-sm"
        >
          {limits.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center flex-nowrap gap-1 overflow-hidden">
        <button
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="px-2 sm:px-3 py-2 text-s sm:text-m rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Prev
        </button>

        {getPageNumbers().map((pg, idx) =>
          pg === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-gray-500 text-xs sm:text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => onPageChange(Number(pg))}
              className={`px-3 py-2 text-s sm:text-m rounded cursor-pointer ${
                page === pg
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {pg}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-2 sm:px-3 py-2 text-s sm:text-m rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
