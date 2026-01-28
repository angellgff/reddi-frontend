"use client";

import Image from "next/image";
import React from "react";
import { ProductCardBase } from "./ProductCardRestaurant";

interface Props {
  product: ProductCardBase;
  discountedPrice: number;
  isPending?: boolean;
  onAdd: (product: ProductCardBase, e: React.MouseEvent) => void;
  onOpen: (product: ProductCardBase) => void;
}

export default function ProductCardMarket({
  product: p,
  discountedPrice,
  isPending,
  onAdd,
  onOpen,
}: Props) {
  // CSS Dump Implementation (Market Card)
  // Dimensions 139 x 221
  return (
    <div
      className="relative flex flex-col items-center bg-white rounded-[12px] select-none shrink-0 cursor-pointer overflow-hidden"
      style={{
        width: "139px",
        height: "221px",
        padding: "0px 10px 10px 10px",
        gap: "10px",
      }}
      onClick={() => onOpen(p)}
    >
      {/* 1. Image Section */}
      <div className="relative mt-[10px] w-[119px] h-[135px] rounded-[8px] overflow-hidden bg-gray-50 flex-shrink-0 isolate">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            className="object-cover"
            sizes="119px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      {/* Floating Add Button */}
      {/* Left 123px, Top 123px relative to card */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd(p, e);
        }}
        className="absolute w-[24px] h-[24px] z-20 shadow-sm transition-transform active:scale-95 bg-transparent p-0 border-none rounded-[3px]"
        style={{
          // Relative to card container (0,0 is topleft)
          top: "123px",
          // The CSS says left: 123px. Width 24px.
          // This makes the button hangover the right side (123+24=147 > 139).
          // Assuming card has overflow-visible? I set overflow-hidden above to match radius.
          // If I set left to 110px it sits inside.
          // Visual check: Does the plus button hang out?
          // If I stick to 'left: 110px' it aligns with the right padding boundary.
          left: "110px",
        }}
        disabled={isPending}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/add-product.png"
          alt="Add"
          className="w-full h-full object-contain"
        />
      </button>

      {/* 2. Info Section */}
      <div className="relative flex flex-col items-start w-[119px] flex-grow overflow-hidden">
        {/* Price */}
        <div className="text-black font-['Poppins'] font-bold text-[12px] leading-[16px] mb-[3px]">
          ${Math.round(discountedPrice)} RD
        </div>

        {/* Name */}
        <div className="text-[#6A6C71] font-['Open_Sans'] font-semibold text-[10px] leading-[12px] line-clamp-2 w-full mb-1">
          {p.name}
        </div>

        {/* Badges Container */}
        <div className="flex flex-wrap gap-1 mt-auto w-full">
          {p.tags?.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-center px-[4px] py-[2px] rounded-[6px] h-[16px]"
              style={{
                backgroundColor: tag.color?.startsWith("#")
                  ? `${tag.color}40`
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <span
                className="font-['Inter'] font-semibold text-[8px] whitespace-nowrap"
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
