import { useState } from "react";
import { TransactionQuery } from "@/types/transaction-querries";

interface FilterProps {
  onChange: (filters: TransactionQuery) => void;
  onReset: () => void;
  onClose?: () => void;
}

export default function TransactionFilters({
  onChange,
  onReset,
  onClose,
}: FilterProps) {
  const [filters, setFilters] = useState<TransactionQuery>({});

  const handleChange = (field: keyof TransactionQuery, value: string) => {
    const isNumberField = field === "minValue" || field === "maxValue";
    const parsedValue =
      value === "" ? undefined : isNumberField ? parseFloat(value) : value;

    setFilters((prev) => ({
      ...prev,
      [field]: parsedValue,
    }));
  };

  const handleApply = () => {
    onChange(filters);
    onClose?.();
  };

  const handleReset = () => {
    setFilters({});
    onReset();
    onClose?.();
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-md shadow flex flex-wrap gap-4 items-end">
      <div className="flex flex-col w-full md:w-48">
        <label className="text-sm text-gray-600 mb-1">Buyer Name</label>
        <input
          type="text"
          value={filters.buyer || ""}
          onChange={(e) => handleChange("buyer", e.target.value)}
          className={`rounded px-3 py-2 transition focus:outline-none focus:ring-1 ${
            filters.buyer ? "border-gray-800" : "border-gray-300"
          } border`}
          placeholder="e.g. Alice"
        />
      </div>

      <div className="flex flex-col w-full md:w-48">
        <label className="text-sm text-gray-600 mb-1">Seller Name</label>
        <input
          type="text"
          value={filters.seller || ""}
          onChange={(e) => handleChange("seller", e.target.value)}
          className={`rounded px-3 py-2 transition focus:outline-none focus:ring-1 ${
            filters.seller ? "border-gray-800" : "border-gray-300"
          } border`}
          placeholder="e.g. John Doe"
        />
      </div>

      <div className="flex flex-col w-full md:w-32">
        <label className="text-sm text-gray-600 mb-1">Min Value</label>
        <input
          type="number"
          value={filters.minValue?.toString() || ""}
          onChange={(e) => handleChange("minValue", e.target.value)}
          className={`rounded px-3 py-2 transition focus:outline-none focus:ring-1 ${
            filters.minValue !== undefined
              ? "border-gray-800"
              : "border-gray-300"
          } border`}
        />
      </div>

      <div className="flex flex-col w-full md:w-32">
        <label className="text-sm text-gray-600 mb-1">Max Value</label>
        <input
          type="number"
          value={filters.maxValue?.toString() || ""}
          onChange={(e) => handleChange("maxValue", e.target.value)}
          className={`rounded px-3 py-2 transition focus:outline-none focus:ring-1 ${
            filters.maxValue !== undefined
              ? "border-gray-800"
              : "border-gray-300"
          } border`}
        />
      </div>

      <div className="flex flex-col w-full md:w-44">
        <label className="text-sm text-gray-600 mb-1">Start Date</label>
        <input
          type="date"
          value={filters.startDate || ""}
          onChange={(e) => handleChange("startDate", e.target.value)}
          className={`rounded px-3 py-2 transition focus:outline-none focus:ring-1 ${
            filters.startDate
              ? "border-gray-800"
              : "border-gray-300"
          } border`}
        />
      </div>

      <div className="flex flex-col w-full md:w-44">
        <label className="text-sm text-gray-600 mb-1">End Date</label>
        <input
          type="date"
          value={filters.endDate || ""}
          onChange={(e) => handleChange("endDate", e.target.value)}
          className={`rounded px-3 py-2 transition focus:outline-none focus:ring-1 ${
            filters.endDate
              ? "border-gray-800"
              : "border-gray-300"
          } border`}
        />
      </div>

      <div className="flex justify-between w-full mt-4">
        <button
          onClick={handleReset}
          type="button"
          className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2 rounded cursor-pointer hover:bg-gray-200 transition"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          type="button"
          className="bg-gray-800 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-900 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
