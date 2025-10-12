// components/RecommendedSection.tsx

import React from "react";
import Link from "next/link";
import { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import RestaurantCard from "@/src/components/basics/itemsSlider/SliderItem";

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
  console.log(cards);
  return (
    <div className="max-w-7xl mx-auto">
      {/* Encabezado de la sección */}
      <div className="sm:px-6 mb-4">
        <h2 id={title} className="text-2xl font-bold text-gray-900">
          {title}
        </h2>
      </div>

      {/* Carrusel de tarjetas */}
      <div className="flex gap-4 overflow-x-auto  scrollbar-hide sm:px-6">
        {cards.map((item, idx) => (
          <RestaurantCard key={`${item.id}-${idx}`} {...item} />
        ))}
      </div>

      {/* Enlace "Mostrar todo" */}
      <div className="mt-1 sm:px-6">
        <Link
          href={href}
          className="
              font-inter font-medium 
              underline decoration-2 underline-offset-4
              hover:text-teal-600 focus:outline-none focus:ring-2 
              focus:ring-teal-500 focus:ring-offset-2
            "
        >
          Mostrar todo
        </Link>
      </div>
    </div>
  );
}
