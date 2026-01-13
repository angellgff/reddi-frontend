import { Skeleton } from "@/src/components/ui/skeleton";
import StoreMenuSkeleton from "@/src/components/features/finalUser/store/StoreMenuSkeleton";

function StoreHeaderSkeleton() {
  return (
    <div className="relative h-48 w-full bg-gray-100 sm:h-64">
      {/* Cover Image Skeleton */}
      <Skeleton className="h-full w-full" />

      {/* Info Overlay / Container */}
      <div className="absolute -bottom-8 left-4 right-4 rounded-xl bg-white p-4 shadow-md sm:left-8 sm:right-auto sm:w-96">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StorePageSkeleton() {
  return (
    <div className="pb-20">
      <StoreHeaderSkeleton />
      <div className="mt-12 px-4 sm:px-8">
        <StoreMenuSkeleton />
      </div>
    </div>
  );
}
