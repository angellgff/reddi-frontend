import { Skeleton } from "@/src/components/ui/skeleton";

export default function FavoritesSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <Skeleton className="mb-4 h-8 w-48" /> {/* Title */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border p-4">
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
