// components/SpecialPromosSection.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import PromoCard from "./PromoCard";

// Datos de ejemplo para las tarjetas promocionales
const promos = [
  {
    title: "Tu comida favorita",
    subtitle: "directo a yates y villas",
    buttonText: "Haz tu pedido",
    imageUrl: "/favorite-food.jpg", // Reemplaza con tus imágenes
    href: "/promos/yates-villas",
    bgColor: "bg-black",
    textColor: "text-white",
  },
  {
    title: "Ahorra en grande",
    subtitle: "en tu súper de la semana",
    buttonText: "Ver ofertas",
    imageUrl: "/40off.jpg", // Reemplaza con tus imágenes
    href: "/mercado/ofertas",
    bgColor: "bg-amber-400",
    textColor: "text-gray-900",
  },
  {
    title: "Noches de antojo",
    subtitle: "snacks y bebidas 24/7",
    buttonText: "Pedir ahora",
    imageUrl: "/enjoy-free.jpg", // Reemplaza con tus imágenes
    href: "/tiendas/24-horas",
    bgColor: "bg-slate-800",
    textColor: "text-white",
  },
];

const SpecialPromosSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const itemWidth = 336; // w-80 (320px) + gap-4 (16px)
        const currentScroll = scrollRef.current.scrollLeft;
        const currentIndex = Math.round(currentScroll / itemWidth);
        const nextIndex = (currentIndex + 1) % promos.length;

        scrollRef.current.scrollTo({
          left: nextIndex * itemWidth,
          behavior: "smooth",
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="w-full py-6" aria-label="Promociones especiales">
      {/* Contenedor del carrusel */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="
          flex w-full items-center gap-4 
          overflow-x-auto pb-4 
          px-4 sm:px-6 
          scrollbar-hide
        "
      >
        {/* Mapeamos los datos para renderizar cada PromoCard */}
        {promos.map((promo) => (
          <PromoCard key={promo.title} {...promo} />
        ))}
      </div>
    </section>
  );
};

export default SpecialPromosSection;
