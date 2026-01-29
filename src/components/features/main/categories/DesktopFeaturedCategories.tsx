"use client";

import Image from "next/image";
import Link from "next/link"; // 1. Importar Link

type Category = {
  name: string;
  imageUrl: string;
  href: string;
  imageW?: number;
  imageH?: number;
};

const categories: Category[] = [
  {
    name: "Mercado",
    imageUrl: "/new-market-logo.png",
    href: "/user/search?type=market",
    imageW: 111,
    imageH: 79,
  },
  {
    name: "Restaurantes",
    imageUrl: "/restaurant.png",
    href: "/user/search?type=restaurant",
    imageW: 86,
    imageH: 108,
  },
  {
    name: "Mandao’",
    imageUrl: "/mandao.png",
    href: "",
    imageW: 109,
    imageH: 109,
  },
  {
    name: "Alcohol",
    imageUrl: "/alcohol.svg",
    href: "/user/search?type=liquor_store",
    imageW: 108,
    imageH: 109,
  },
  {
    name: "Farmacia",
    imageUrl: "/farmacia.png",
    href: "/user/search?type=pharmacy",
    imageW: 80,
    imageH: 80,
  },
  {
    name: "Tabaco",
    imageUrl: "/Tobacco.svg",
    href: "/user/search?type=tobacco",
    imageW: 106,
    imageH: 108,
  },
];

export default function DesktopFeaturedCategories({
  className = "",
}: {
  className?: string;
}) {
  return (
    <section
      className={`hidden p-4 md:px-6 lg:px-8 md:flex w-full items-center justify-between ${className}`}
      aria-labelledby="categorias-destacadas"
    >
      {/* Title */}
      <div className="shrink-0 w-[250px]">
        <h2
          id="categorias-destacadas"
          className="font-semibold text-[28px] leading-8 text-black"
        >
          Categorías <span className="text-primary">destacadas</span>
        </h2>
      </div>

      {/* Categories row: scrollable to avoid overflow */}
      <div className="flex-1 min-w-0">
        <div
          className="flex flex-row items-center gap-[15px] justify-start overflow-x-auto scrollbar-hide pr-2"
          role="list"
        >
          {categories.map((c) => (
            /* 2. Cambiamos el div por Link y añadimos el href */
            <Link
              key={c.name}
              href={c.href}
              role="listitem"
              className="flex-none flex flex-col justify-center items-center p-5 gap-2 w-[146px] h-[169px] bg-[#F0F2F5]/70 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-center justify-center w-[106px] h-[109px]">
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  width={c.imageW ?? 100}
                  height={c.imageH ?? 100}
                  className="object-contain"
                  priority={false}
                />
              </div>
              <div className="flex items-center justify-center">
                <span className="text-[18px] leading-[22px] font-medium text-black text-center">
                  {c.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
