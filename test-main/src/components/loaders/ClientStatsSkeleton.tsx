export default function SkeletonClientStats() {
    return (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white shadow p-6 rounded-lg animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-8 bg-gray-300 rounded" />
            </div>
            <div className="w-px h-10 bg-gray-300 mx-6" />
            <div className="flex flex-col items-center gap-2">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-6 w-8 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
  
        <div className="bg-white shadow p-6 rounded-lg animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-7 w-20 bg-gray-300 rounded" />
        </div>
  
        <div className="bg-white shadow p-6 rounded-lg animate-pulse">
          <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
          <div className="h-7 w-28 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }
  