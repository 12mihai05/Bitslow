import { useEffect, useState } from "react";

export default function MarketSkeleton({ count = 6 }: { count?: number }) {
    
      const [visible, setVisible] = useState(false);
    
      useEffect(() => {
        const timeout = setTimeout(() => {
          setVisible(true);
        }, 200);
    
        return () => clearTimeout(timeout);
      }, []);
    
      if (!visible) return null;
    
    return (
      <>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
  
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <div className="h-3 w-20 bg-gray-300 rounded mb-2" />
              <div className="h-4 w-full bg-gray-300 rounded" />
            </div>
  
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="space-y-2">
                <div className="h-3 w-14 bg-gray-300 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-3 w-10 bg-gray-300 rounded ml-auto" />
                <div className="h-4 w-20 bg-gray-200 rounded ml-auto" />
              </div>
              <div className="col-span-2">
                <div className="h-3 w-14 bg-gray-300 rounded mb-1" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            </div>
  
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-300 rounded" />
              <div className="h-8 w-16 bg-gray-400 rounded" />
            </div>
          </div>
        ))}
      </>
    );
  }
  