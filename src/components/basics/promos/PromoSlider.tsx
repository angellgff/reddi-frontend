import PromoCard from "./PromoCard";
import { PromoCardProps } from "./PromoCard";
import HorizontalScrollButtons from "@/src/components/basics/itemsSlider/HorizontalScrollButtons";

export default function PromoSlider({
  promotions,
  className,
}: {
  promotions: PromoCardProps[];
  className?: string;
}) {
  const safeId = "promo-slider";
  return (
    <section className={className}>
      <div className="mb-4 sm:px-6 hidden md:flex items-center justify-end">
        <HorizontalScrollButtons targetId={safeId} />
      </div>
      <div
        id={safeId}
        className="flex space-x-4 overflow-x-auto scrollbar-hide"
      >
        {promotions.map((promo) => (
          <div key={promo.title} className="flex-none w-3/4 sm:w-1/2 md:w-1/4">
            <PromoCard
              title={promo.title}
              subtitle={promo.subtitle}
              code={promo.code}
              buttonText={promo.buttonText}
              imageUrl={promo.imageUrl}
              bgColor={promo.bgColor}
              href={promo.href}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
