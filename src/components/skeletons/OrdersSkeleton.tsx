import { Skeleton } from "@/src/components/ui/skeleton";

export default function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" /> {/* Title */}
        <Skeleton className="hidden h-8 w-32 sm:block" /> {/* Filter/Action desktop */}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border p-4 shadow-sm sm:flex sm:items-center sm:justify-between">
            {/* Mobile/Desktop common content */}
            <div className="flex items-center space-x-4">
               {/* Icon/Image */}
              <Skeleton className="h-16 w-16 rounded-md" />
              
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" /> {/* Order number/Date */}
                <Skeleton className="h-4 w-24" /> {/* Status */}
              </div>
            </div>

            {/* Desktop only columns */}
            <div className="hidden items-center space-x-8 sm:flex">
               <Skeleton className="h-4 w-20" /> {/* Total */}
               <Skeleton className="h-8 w-24 rounded-full" /> {/* Action Button */}
            </div>
            
            {/* Mobile only row for total/action */}
            <div className="mt-4 flex items-center justify-between sm:hidden">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
