"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Promotion {
  id: string;
  title: string;
  imageUrl: string;
  actionLink: string | null;
  description: string | null;
}

interface SearchPromoSliderProps {
  promotions: Promotion[];
}

export default function SearchPromoSlider({
  promotions,
}: SearchPromoSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      // Approximate item width including gap (340px + 12px gap)
      const itemWidth = 352;
      const index = Math.round(scrollLeft / itemWidth);
      setActiveIndex(Math.min(Math.max(0, index), promotions.length - 1));
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-[15px] mb-6 md:hidden">
      {/* Slider Container - Left aligned initially but centered scroll */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto no-scrollbar flex items-center px-4 gap-3 snap-x snap-mandatory"
      >
        {promotions.map((promo, i) => (
          <div
            key={promo.id}
            className="flex-shrink-0 w-[340px] md:w-[363px] h-[120px] bg-[#D1D1D6] rounded-[6px] snap-center relative overflow-hidden"
          >
            <Link
              href={promo.actionLink || "#"}
              className="block w-full h-full relative"
            >
              <Image
                src={promo.imageUrl}
                alt={promo.title}
                fill
                className="object-cover"
              />
            </Link>
          </div>
        ))}
        {/* Peek effect spacer */}
        <div className="w-2 flex-shrink-0"></div>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center gap-[5px]">
        {promotions.map((_, index) => (
          <div
            key={index}
            className={`h-[5px] rounded-[10px] transition-all duration-300 ${
              index === activeIndex
                ? "w-[20px] bg-[#FFCF58]" // Active dot styling (approx based on Figma intent, made wider for visibility)
                : "w-[10.5px] bg-[#D5DEE7]"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
}
