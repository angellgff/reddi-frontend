"use client";

export default function SliderLoading() {
  return (
    <div className="min-h-screen bg-white p-4 animate-pulse">
      {/* Search Bar Skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 h-10 bg-gray-200 rounded-full" />
      </div>

      {/* Category Tabs Skeleton */}
      <div className="flex gap-4 mb-6 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 w-20 bg-gray-200 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
