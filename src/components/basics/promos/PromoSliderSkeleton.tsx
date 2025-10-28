import PromoCardSkeleton from "./PromoCardSkeleton";

export default function PromoSlider() {
  return (
    <section>
      {/* Mobile skeleton: horizontal scroll */}
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide md:hidden">
        <PromoCardSkeleton />
        <PromoCardSkeleton />
      </div>

      {/* Desktop skeleton: grid of 4 */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
        <PromoCardSkeleton variant="desktop" />
        <PromoCardSkeleton variant="desktop" />
        <PromoCardSkeleton variant="desktop" />
        <PromoCardSkeleton variant="desktop" />
      </div>
    </section>
  );
}
