"use client";

import SliderCard, {
  SliderCardProps,
} from "@/src/components/basics/itemsSlider/SliderItem";

export default function SearchResultsGrid({
  products, // We keep the prop name for now or rename? Let's check page.tsx usage.
}: {
  products: SliderCardProps[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
      {products.map((p) => (
        <SliderCard key={p.id} {...p} />
      ))}
    </div>
  );
}
