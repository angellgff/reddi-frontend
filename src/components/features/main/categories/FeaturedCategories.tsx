// components/FeaturedCategories.tsx

import React from "react";
import CategoryCard from "./CategoryCard";

// 1. Define los datos de tus categorías
// ¡IMPORTANTE! Deberás reemplazar 'imageUrl' con las rutas a tus propias imágenes.
const categories = [
  {
    name: "Restaurant",
    imageUrl: "/burger.svg", // Ruta de ejemplo
    href: "/categorias/restaurantes",
  },
  {
    name: "Mercado",
    imageUrl: "/uber_grocer.svg", // Ruta de ejemplo
    href: "/categorias/mercado",
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
      {/* Título (Opcional pero recomendado para accesibilidad) */}
      {/* Contenedor con scroll horizontal */}
      <div
        className="
          flex w-full items-start gap-4 
          overflow-x-auto 
          sm:px-6 
          scrollbar-hide
        "
      >
        {/* 2. Mapea los datos y renderiza cada CategoryCard */}
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            name={category.name}
            imageUrl={category.imageUrl}
            href={category.href}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
