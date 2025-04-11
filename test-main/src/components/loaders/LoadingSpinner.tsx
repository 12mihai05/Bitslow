import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  message?: string;
  elapsedSeconds?: number;
}

export default function LoadingSpinner({
  message = "Loading...",
  elapsedSeconds,
}: LoadingSpinnerProps) {

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 200);

    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <div className="w-16 h-16 mb-4 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      <div className="animate-pulse flex flex-col items-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{message}</h2>
        {elapsedSeconds !== undefined && (
          <p className="text-sm text-gray-600 mb-2">
            Time elapsed: {elapsedSeconds} seconds
          </p>
        )}
      </div>
    </div>
  );
}
