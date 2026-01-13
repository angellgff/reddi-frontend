import { Skeleton } from "@/src/components/ui/skeleton";

export default function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Search Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Filters Row */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 flex-shrink-0 rounded-full" />
          ))}
        </div>

        {/* Results Title */}
        <Skeleton className="mb-4 h-8 w-48" />

        {/* Results Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex flex-col space-y-3 rounded-xl bg-white p-4 shadow-sm"
            >
              <Skeleton className="h-40 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
