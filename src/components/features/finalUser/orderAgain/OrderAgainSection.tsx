import React from "react";
import { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import RecommendedCard from "@/src/components/basics/recommended/RecommendedCard";
import HorizontalScrollButtons from "@/src/components/basics/itemsSlider/HorizontalScrollButtons";

export default function OrderAgainSection({
  items,
}: {
  items: SliderCardProps[];
}) {
  const title = "Pide otra vez";
  const safeId = `slider-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="w-full font-openSans px-4 pb-4 border-b-[1px] border-[rgba(183,183,183,0.37)]">
      {/* Encabezado de la sección */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2
          id={title}
          className="font-openSans text-2xl font-bold text-gray-900"
        >
          {title}
        </h2>
        {/* Botones de scroll */}
        <HorizontalScrollButtons targetId={safeId} />
      </div>

      {/* Carrusel de tarjetas */}
      <div
        id={safeId}
        className="flex gap-4 overflow-x-auto scrollbar-hide sm:px-6 md:px-0"
      >
        {items.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex-none">
            <RecommendedCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
