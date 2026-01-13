import { Skeleton } from "@/src/components/ui/skeleton";

export default function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-6 h-8 w-48" /> {/* Title */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Items List */}
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 rounded-lg border p-4">
              <Skeleton className="h-20 w-20 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex flex-col items-end justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary / Sidebar */}
        <div className="w-full lg:w-96">
          <div className="rounded-lg border p-6 shadow-sm">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="my-2 border-t pt-2" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="mt-6 h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
