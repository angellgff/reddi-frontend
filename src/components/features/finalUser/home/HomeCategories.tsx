"use client";

import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Restaurantes",
    image: "/Restaurants.svg",
    href: "/user/search?type=restaurant",
  },
  {
    name: "Mercado",
    image: "/Market.png",
    href: "/user/search?type=market",
  },
  {
    name: "Tabaco",
    image: "/tabaco.png",
    href: "/user/search?type=tobacco",
  },
  {
    name: "Alcohol",
    image: "/alcohol.png",
    href: "/user/search?type=liquor_store",
  },
  {
    name: "Farmacia",
    image: "/farmacia-tiny.png",
    href: "/user/search?type=pharmacy",
  },
];

export default function HomeCategories() {
  return (
    <div className="flex justify-between items-start gap-4 overflow-x-auto px-4 py-4 no-scrollbar border-b-[1px] border-[rgba(183,183,183,0.37)]">
      {categories.map((cat) => (
        <Link
          key={cat.name}
          href={cat.href}
          className="flex flex-col items-center gap-2 min-w-[60px]"
        >
          <div className="w-[64px] h-[64px] relative rounded-full flex items-center justify-center shadow-sm bg-white overflow-hidden p-1">
            <Image
              src={cat.image}
              alt={cat.name}
              width={64}
              height={64}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="text-[13px] font-medium text-center text-black leading-tight">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
