// components/RecommendedSection.tsx

import React from "react";
import Link from "next/link";
import { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import RestaurantCard from "@/src/components/basics/itemsSlider/SliderItem";
import HorizontalScrollButtons from "@/src/components/basics/itemsSlider/HorizontalScrollButtons";

export default function SliderSection({
  cards,
  title,
  href,
}: {
  cards: SliderCardProps[];
  title: string;
  href: string;
  className?: string;
}) {
  const safeId = `slider-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="w-full">
      {/* Encabezado de la sección */}
      <div className="mb-4 sm:px-6 flex items-center justify-between gap-4">
        <h2 id={title} className="text-2xl font-bold text-gray-900">
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

      {/* Enlace "Mostrar todo" */}
      <div className="mt-1 sm:px-6">
        <Link
          href={href}
          className="font-inter font-medium underline decoration-2 underline-offset-4 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Mostrar todo
        </Link>
      </div>
    </div>
  );
}
