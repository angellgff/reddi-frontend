import { Skeleton } from "@/src/components/ui/skeleton";

export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Basic Back Button Placeholder */}
        <div className="md:col-span-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Image Section */}
        <div className="aspect-square w-full">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" /> {/* Title */}
          <Skeleton className="h-24 w-full" /> {/* Description */}
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-1/3" /> {/* Price */}
            {/* Options / Addons */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          {/* Add to cart / Quantity */}
          <div className="flex items-center gap-4 pt-8">
            <Skeleton className="h-12 w-32 rounded-full" /> {/* Qty */}
            <Skeleton className="h-12 w-full rounded-full" /> {/* Add btn */}
          </div>
        </div>
      </div>
    </div>
  );
}
