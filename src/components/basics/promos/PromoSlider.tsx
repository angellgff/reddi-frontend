"use client";

import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || promotions.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const itemWidth = 366; // 350px width + 16px gap
        const currentScroll = scrollRef.current.scrollLeft;
        const currentIndex = Math.round(currentScroll / itemWidth);
        const nextIndex = (currentIndex + 1) % promotions.length;

        scrollRef.current.scrollTo({
          left: nextIndex * itemWidth,
          behavior: "smooth",
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, promotions.length]);

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
        ref={scrollRef}
        className="flex space-x-4 px-2 overflow-x-auto scrollbar-hide md:hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {promotions.map((promo) => (
          <div key={promo.title} className="flex-none">
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
