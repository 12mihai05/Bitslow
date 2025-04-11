import { useCoinHistory } from "@/hooks/useCoinHistory";
import { useEffect } from "react";

interface HistoryModalProps {
  coinId: number | null;
  show: boolean;
  onClose: () => void;
}

export default function HistoryModal({
  coinId,
  show,
  onClose,
}: HistoryModalProps) {
  const {
    history,
    loading: loadingHistory,
    error: historyError,
  } = useCoinHistory(coinId);

  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  if (!show || coinId === null) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-75 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Previous Owners
        </h2>

        {loadingHistory ? (
          <p className="text-sm text-gray-500">Loading history...</p>
        ) : historyError ? (
          <p className="text-sm text-red-600">{historyError}</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500">
            No ownership history available.
          </p>
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {history.map((entry, index) => (
              <li key={index}>
                {entry.client_name}{" "}
                <span className="text-gray-400 text-xs">
                  ({new Date(entry.timestamp + "Z").toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
