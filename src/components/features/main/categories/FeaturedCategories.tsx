// components/FeaturedCategories.tsx

import React from "react";
import CategoryCard from "./CategoryCard";
import HorizontalScrollButtons from "@/src/components/basics/itemsSlider/HorizontalScrollButtons";

// 1. Define los datos de tus categorías
// ¡IMPORTANTE! Deberás reemplazar 'imageUrl' con las rutas a tus propias imágenes.
const categories = [
  {
    name: "Mandao´",
    imageUrl: "/mandao.svg", // Ruta de ejemplo
    href: "/categorias/mandao",
  },
  {
    name: "Alcohol",
    imageUrl: "/alcohol.svg", // Ruta de ejemplo
    href: "/categorias/alcohol",
  },
  {
    name: "Farmacia",
    imageUrl: "/group.svg", // Ruta de ejemplo
    href: "/categorias/farmacia",
  },
  {
    name: "Tabaco",
    imageUrl: "/Tobacco.svg", // Ruta de ejemplo
    href: "/categorias/tabaco",
  },
];

const FeaturedCategories: React.FC = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <section className={`${className}`} aria-labelledby="categorias-destacadas">
      {/* Botones de scroll (desktop) */}
      <div className="mb-4 sm:px-6 hidden md:flex items-center justify-end">
        <HorizontalScrollButtons targetId="featured-categories-row" />
      </div>
      {/* Contenedor con scroll horizontal */}
      <div
        className="flex w-full items-start gap-4 overflow-x-auto sm:px-6 scrollbar-hide snap-x snap-mandatory"
        id="featured-categories-row"
      >
        {/* 2. Mapea los datos y renderiza cada CategoryCard */}
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            name={category.name}
            imageUrl={category.imageUrl}
            href={category.href}
            className="snap-start"
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
