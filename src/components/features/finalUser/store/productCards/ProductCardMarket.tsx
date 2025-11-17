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
  return (
    <div
      className="w-[153px] h-[167px] box-border bg-white border border-[#D9DCE3] rounded-[12px] p-[10px] flex flex-col items-center justify-center gap-[10px] cursor-pointer select-none"
      onClick={() => onOpen(p)}
    >
      {/* Image container */}
      <div className="relative w-[133px] h-[89px] rounded-[8px] overflow-hidden bg-white isolate">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            sizes="133px"
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>

      {/* Bottom info row */}
      <div className="flex items-end w-[133px] h-[48px]">
        <div className="flex flex-col items-start w-[116px] h-[48px]">
          <div className="text-[12px] leading-4 font-bold text-black uppercase">
            {Math.round(discountedPrice)} USD
          </div>
          <div className="text-[12px] leading-4 text-[#6A6C71] line-clamp-2 uppercase">
            {p.name}
          </div>
        </div>
        {/* Add button */}
        <button
          aria-label="Agregar"
          className="ml-auto w-[17px] h-[17px] rounded-[3px] grid place-items-center"
          style={{ background: "#00D585" }}
          onClick={(e) => onAdd(p, e)}
          disabled={isPending}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 0H5V9H4V0Z" fill="white" />
            <path d="M9 4V5H0V4H9Z" fill="white" />
          </svg>
        </button>
      </div>
    </div>
  );
}
