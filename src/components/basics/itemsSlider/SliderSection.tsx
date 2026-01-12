// components/RecommendedSection.tsx

import React from "react";
import { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import RestaurantCard from "@/src/components/basics/itemsSlider/SliderItem";
import HorizontalScrollButtons from "@/src/components/basics/itemsSlider/HorizontalScrollButtons";

export default function SliderSection({
  cards,
  title,
}: {
  cards: SliderCardProps[];
  title: string;
  href: string;
  className?: string;
}) {
  const safeId = `slider-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="w-full font-openSans">
      {/* Encabezado de la sección */}
      <div className="mb-4  flex items-center justify-between gap-4">
        <h2
          id={title}
          className="font-openSans text-2xl font-bold text-gray-900"
        >
          {title}
        </h2>
        {/* Botones de scroll solo en desktop */}
        <HorizontalScrollButtons targetId={safeId} />
      </div>

      {/* Carrusel de tarjetas */}
      <div
        id={safeId}
        className="flex gap-4 overflow-x-auto scrollbar-hide sm:px-6 md:px-0"
      >
        {cards.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex-none w-3/4 sm:w-1/2 md:w-1/4"
          >
            <RestaurantCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
