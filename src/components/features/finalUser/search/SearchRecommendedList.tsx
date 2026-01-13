"use client";

import React from "react";
import SearchRecommendedCard, {
  SearchRecommendedCardProps,
} from "./SearchRecommendedCard";

export default function SearchRecommendedList({
  items,
  title = "Recomendados para ti",
}: {
  items: SearchRecommendedCardProps[];
  title?: string;
}) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Title */}
      <h2 className="text-[20px] font-bold text-black font-[Open Sans] leading-[22px]">
        {title}
      </h2>

      {/* Horizontal Scroll List */}
      <div className="w-full overflow-x-auto no-scrollbar pb-4 -ml-4 pl-4 pr-4 md:ml-0 md:pl-0">
        <div className="flex flex-row gap-[18px] w-max">
          {items.map((item) => (
            <SearchRecommendedCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
