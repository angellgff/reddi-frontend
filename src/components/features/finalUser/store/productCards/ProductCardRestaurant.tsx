"use client";

import Image from "next/image";
import React from "react";

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
  discountedPrice: number;
  isPending?: boolean;
  onAdd: (product: ProductCardBase, e: React.MouseEvent) => void;
  onOpen: (product: ProductCardBase) => void;
}

export default function ProductCardRestaurant({
  product: p,
  onOpen,
  onAdd,
}: Props) {
  return (
    <div
      className="flex flex-col bg-white rounded-[12px] px-[10px] gap-[10px] justify-center items-center cursor-pointer flex-shrink-0 w-[139px] h-[171px] relative shadow-none"
      onClick={() => onOpen(p)}
    >
      {/* Image Section */}
      <div className="relative w-[119px] h-[75px] rounded-[8px] overflow-hidden flex-shrink-0">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            sizes="119px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}

        {/* Add Button */}
        <button
          type="button"
          onClick={(e) => onAdd(p, e)}
          className="absolute right-[5px] bottom-[5px] w-[24px] h-[24px] rounded-full z-10 hover:opacity-90 active:scale-95 transition-all"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/add-product.png"
            alt="Add"
            className="w-full h-full object-contain"
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-start w-[119px] gap-[4px] relative">
        {/* Title & Price Group */}
        <div className="w-full flex flex-col items-start gap-1">
          {/* Title */}
          <h3 className="text-[12px] font-[600] font-['Open_Sans'] text-black leading-[16px] line-clamp-1 w-full text-left">
            {p.name}
          </h3>

          {/* Price */}
          <span className="text-[8px] font-[600] font-['Open_Sans'] text-[#6A6C71] leading-[10px]">
            ${p.display_price} RD
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 w-full mt-1">
          {p.tags?.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-center px-[4px] py-[1px] rounded-[4px]"
              style={{
                backgroundColor: tag.color?.startsWith("#")
                  ? `${tag.color}30`
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <span
                className="font-['Inter'] font-semibold text-[7px] whitespace-nowrap"
                style={{ color: tag.color || "#666" }}
              >
                {tag.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
