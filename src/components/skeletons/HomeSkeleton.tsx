import { Skeleton } from "@/src/components/ui/skeleton";
import SliderSectionSkeleton from "@/src/components/basics/itemsSlider/SliderSectionSkeleton"; // reusing existing if possible
import PromoSliderSkeleton from "@/src/components/basics/promos/PromoSliderSkeleton"; // reusing existing if possible

// If those imports fail (I should check paths), I'll define simple local versions.
// I saw them in `home/page.tsx` imports so they exist.

export default function HomeSkeleton() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white pb-32">
      {/* Categories Row */}
      <div className="mb-6 flex gap-4 overflow-hidden px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Greeting */}
      <div className="mb-4 px-4">
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Promo Banner */}
      <div className="mb-6 px-4">
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>

      {/* Partners List */}
      <div className="mb-8 px-4 space-y-4">
        <Skeleton className="h-6 w-32 mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b pb-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Section (Slider) */}
      <div className="mb-8 px-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex gap-4 overflow-hidden">
          <Skeleton className="h-40 w-32 rounded-lg flex-shrink-0" />
          <Skeleton className="h-40 w-32 rounded-lg flex-shrink-0" />
          <Skeleton className="h-40 w-32 rounded-lg flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
