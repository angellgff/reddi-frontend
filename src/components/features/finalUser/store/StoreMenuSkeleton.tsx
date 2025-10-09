export default function StoreMenuSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-10 bg-gray-200 rounded md:col-span-2" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((__, j) => (
              <div key={j} className="border border-gray-200 rounded-xl p-3">
                <div className="w-full h-28 bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-32 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
