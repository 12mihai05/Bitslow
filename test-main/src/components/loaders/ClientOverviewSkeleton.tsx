export default function ClientOverviewSkeleton() {
    
  const skeletonCard = (
    <div className="min-w-[280px] bg-white/70 border border-gray-100 rounded-xl shadow-sm p-5 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-32 bg-gray-100 rounded mb-4" />

      <div className="bg-gray-100 rounded-lg px-3 py-2 mb-3">
        <div className="h-2 w-20 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-full bg-gray-300 rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="h-2 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-12 bg-gray-300 rounded" />
        </div>
        <div className="text-right">
          <div className="h-2 w-16 bg-gray-200 rounded mb-2 ml-auto" />
          <div className="h-4 w-14 bg-gray-300 rounded ml-auto" />
        </div>
      </div>

      <div className="h-3 w-28 bg-gray-200 rounded mb-4" />

      <div className="h-8 w-full bg-gray-300 rounded" />
    </div>
  );

  const sectionTitle = (width: string = "w-40") => (
    <div className={`h-6 ${width} bg-gray-200 rounded mb-4`} />
  );

  const subsectionTitle = (width: string = "w-32") => (
    <div className={`h-5 ${width} bg-gray-200 rounded mb-3`} />
  );

  return (
    <section className="space-y-10">
      <div>
        {sectionTitle("w-52")}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className={idx === 0 ? "" : "hidden sm:block"}>
              {skeletonCard}
            </div>
          ))}
        </div>
      </div>

      <div>
        {sectionTitle("w-40")}

        {subsectionTitle("w-28")}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`buyer-${idx}`} className={idx === 0 ? "" : "hidden sm:block"}>
              {skeletonCard}
            </div>
          ))}
        </div>

        {subsectionTitle("w-28")}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={`seller-${idx}`} className={idx === 0 ? "" : "hidden sm:block"}>
              {skeletonCard}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}