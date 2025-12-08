"use client";

import SliderCard, {
  SliderCardProps,
} from "@/src/components/basics/itemsSlider/SliderItem";

export default function SearchResultsGrid({
  products,
}: {
  products: SliderCardProps[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
      {products.map((p) => (
        <SliderCard key={p.id} {...p} className="w-full max-w-[320px]" />
      ))}
    </div>
  );
}
