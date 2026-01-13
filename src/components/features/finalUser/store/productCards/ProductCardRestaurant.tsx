"use client";

import Image from "next/image";
import React from "react";
import PlusIcon from "@/src/components/icons/PlusIcon";

export interface ProductCardBase {
  id: string;
  name: string;
  image_url: string | null;
  base_price: number | null;
  display_price: number;
  previous_price: number | null;
  description: string | null;
  discount_percentage: number | null;
}

interface Props {
  product: ProductCardBase;
  discountedPrice: number;
  isPending?: boolean;
  onAdd: (product: ProductCardBase, e: React.MouseEvent) => void;
  onOpen: (product: ProductCardBase) => void;
}

export default function ProductCardRestaurant({
  product: p,
  discountedPrice,
  onOpen,
  onAdd,
}: Props) {
  return (
    <div
      className="flex flex-col bg-white rounded-[12px] shadow-sm hover:shadow-md transition cursor-pointer flex-shrink-0 w-[139px] h-[171px] overflow-hidden relative"
      onClick={() => onOpen(p)}
    >
      {/* Image Section - Top half */}
      <div className="relative w-full h-[90px] bg-gray-100">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            sizes="139px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Content Section */}
      <div className="p-2 flex flex-col flex-1 relative">
        {/* Title */}
        <h3 className="text-[12px] font-bold text-black leading-tight line-clamp-2 mb-1">
          {p.name}
        </h3>

        {/* Description line (Subtitle) */}
        {p.description ? (
            <p className="text-[8px] text-[#6A6C71] font-semibold leading-tight line-clamp-1">
                {p.description}
            </p>
        ) : (
             // Placeholder or empty
             <div className="h-2" />
        )}

        {/* Tag or Info (e.g. -20%) */}
         {/* Temporarily hidden or based on discount */}
        {p.discount_percentage ? (
            <div className="mt-auto mb-1">
                 <span className="bg-[#04BD88]/25 text-[#04BD88] text-[6px] font-bold px-1 py-0.5 rounded">
                    -{p.discount_percentage}%
                 </span>
            </div>
        ) : (
            <div className="mt-auto" />
        )}

        {/* Add Button - Floating Green + Button */}
        <button 
            type="button"
            onClick={(e) => onAdd(p, e)}
            className="absolute right-2 top-[-12px] w-[24px] h-[24px] bg-[#04BD88] rounded-[3px] flex items-center justify-center shadow-md z-10"
        >
            <PlusIcon className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  );
}
