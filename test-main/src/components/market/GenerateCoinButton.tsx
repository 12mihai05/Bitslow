import { useState } from "react";

interface Props {
  generateCoin: () => Promise<{ success: boolean; error?: string }>;
}

export default function GenerateCoinButton({ generateCoin }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsGenerating(true);
    setGenerateError(null);

    const res = await generateCoin();

    setIsGenerating(false);
    if (!res.success) {
      setGenerateError(res.error || "Failed to generate BitSlow.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mb-10">
      <button
        disabled={isGenerating}
        onClick={handleClick}
        className={`px-5 py-5 text-lg font-semibold rounded-md transition-all duration-300 shadow focus:outline-none hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]
          ${
            isGenerating
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-900 cursor-pointer"
          }`}
      >
        <span className="relative inline-block min-w-[240px] h-[1.5em]">
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
              isGenerating
                ? "opacity-0 translate-y-1"
                : "opacity-100 translate-y-0"
            }`}
          >
            Generate New BitSlow
          </span>

          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
              isGenerating
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-1"
            }`}
          >
            Generating...
          </span>
        </span>
      </button>

      {generateError && (
        <p className="text-sm text-red-600 mt-3 text-center max-w-md">
          {generateError}
        </p>
      )}
    </div>
  );
}
