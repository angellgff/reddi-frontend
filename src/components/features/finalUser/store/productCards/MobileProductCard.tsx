"use client";

import Image from "next/image";
import React from "react";
import { Plus } from "lucide-react";

export interface ProductCardBase {
  id: string;
  name: string;
  image_url: string | null;
  base_price: number | null;
  display_price: number;
  previous_price: number | null;
  description: string | null;
  discount_percentage: number | null;
  tags?: {
    id: string;
    name: string;
    color: string | null;
    iconKey: string;
  }[];
}

interface Props {
  product: ProductCardBase;
  onAdd: (product: ProductCardBase, e: React.MouseEvent) => void;
  onOpen: (product: ProductCardBase) => void;
}

export default function MobileProductCard({ product: p, onOpen, onAdd }: Props) {
  // Hardcoded for design match, or dynamic if backend provides it.
  // The screenshot shows "Many in Stock" in green using a specific tag style.
  const stockTag = {
    text: "Many in Stock",
    bg: "#CDF8E9",
    color: "#04BD88",
  };
  
  // Also "Cold Product" tag from screenshot
  const coldTag = {
    text: "Cold Product",
    bg: "#E0F7FA", 
    color: "#00BCD4",
  };

  const discount = p.discount_percentage ? Number(p.discount_percentage) : 0;

  return (
    <div
      className="flex flex-col items-center bg-transparent w-full relative group cursor-pointer"
      onClick={() => onOpen(p)}
    >
      {/* Percentage Tag */}
      {discount > 0 && (
         <div className="absolute top-2 left-0 z-10 bg-[#FFECEC] px-2 py-0.5 rounded-r-[4px]">
             <span className="text-[9px] font-bold text-[#FF5A5A]">{discount}% off</span>
         </div>
      )}

      {/* Image with add button overlaid */}
      <div className="relative w-[160px] h-[130px] rounded-[16px] overflow-visible mb-2">
         {/* Main Image */}
        <div className="w-full h-full rounded-[16px] overflow-hidden relative bg-gray-100 shadow-sm">
             {p.image_url ? (
            <Image
                src={p.image_url}
                alt={p.name}
                fill
                sizes="160px"
                className="object-cover"
            />
            ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs">
                No Image
            </div>
            )}
        </div>

        {/* Add Button (Floating on bottom-right of the image container/area) */}
        <button
          onClick={(e) => onAdd(p, e)}
          className="absolute -bottom-2 -right-2 w-[32px] h-[32px] bg-[#00D68F] rounded-[10px] flex items-center justify-center shadow-lg active:scale-95 transition-transform z-20"
        >
          <Plus className="text-white w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      {/* Content */}
      <div className="w-full flex flex-col items-start px-1 gap-0.5">
        <h3 className="text-[14px] font-bold text-black leading-tight line-clamp-2">
          {p.name}
        </h3>
        <span className="text-[12px] font-bold text-[#6A6C71]">
          RD${p.display_price?.toLocaleString("en-US")}
        </span>

        {/* Tags */}
        <div className="flex flex-col items-start gap-1 mt-1 w-full">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: stockTag.bg, color: stockTag.color }}>
                {stockTag.text}
            </span>
             {/* Mocking cold product tag if needed, logic for tags usually comes from backend */}
             {/* {p.tags?.some(t => t.name === 'Cold') && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: coldTag.bg, color: coldTag.color }}>
                    {coldTag.text}
                </span>
             )} */}
        </div>
      </div>
    </div>
  );
}
