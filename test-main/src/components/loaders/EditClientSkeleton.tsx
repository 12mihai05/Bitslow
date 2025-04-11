export default function SkeletonEditClient() {
    return (
      <div className="bg-white shadow p-6 rounded-lg animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
  
        <div className="space-y-4">
          {[1, 2, 3, 4].map((_, idx) => (
            <div key={idx}>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
  
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-5 w-40 bg-gray-200 rounded" />
          </div>
        </div>
  
        <div className="flex justify-end gap-3 mt-6">
          <div className="h-10 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-28 bg-gray-400 rounded" />
        </div>
      </div>
    );
  }