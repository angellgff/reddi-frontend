import PromoCard from "./PromoCard";
import { PromoCardProps } from "./PromoCard";

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
      {/* Header (desktop only) */}
      <div className="hidden md:flex items-center justify-between mb-4">
        <h2 className="font-bold text-[32px] leading-10 text-black">
          Promociones especiales
        </h2>
      </div>

      {/* Mobile slider (unchanged) */}
      <div
        id={safeId}
        className="flex space-x-4 overflow-x-auto scrollbar-hide md:hidden"
      >
        {promotions.map((promo) => (
          <div key={promo.title} className="flex-none w-3/4 sm:w-1/2">
            <PromoCard
              title={promo.title}
              subtitle={promo.subtitle}
              code={promo.code}
              buttonText={promo.buttonText}
              imageUrl={promo.imageUrl}
              bgColor={promo.bgColor}
              href={promo.href}
              variant="mobile"
            />
          </div>
        ))}
      </div>

      {/* Desktop grid (4 columns as per Figma) */}
      <div className="hidden md:flex gap-6">
        {promotions.map((promo) => (
          <PromoCard
            key={promo.title}
            title={promo.title}
            subtitle={promo.subtitle}
            code={promo.code}
            buttonText={promo.buttonText}
            imageUrl={promo.imageUrl}
            bgColor={promo.bgColor}
            href={promo.href}
            variant="desktop"
          />
        ))}
      </div>
    </section>
  );
}
