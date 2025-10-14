"use client";

import Image from "next/image";
import React from "react";

export interface ProductCardBase {
  id: string;
  name: string;
  image_url: string | null;
  base_price: number | null;
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
  isPending,
  onAdd,
  onOpen,
}: Props) {
  return (
    <div
      className="flex flex-row items-center gap-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => onOpen(p)}
    >
      {/* Image Section */}
      <div className="relative flex-shrink-0 w-[153px] h-[89px]">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            sizes="153px"
            className="object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-lg" />
        )}
      </div>

      {/* Text Content Section */}
      <div className="flex flex-col self-stretch flex-1 py-1 pr-2 gap-1">
        <p className="font-bold text-black text-base leading-tight truncate">
          {p.name}
        </p>

        {p.description && (
          <p className="text-gray-500 text-xs line-clamp-2 leading-snug">
            {p.description}
          </p>
        )}

        <div className="flex items-center gap-1 mt-auto text-xs">
          {p.discount_percentage && (
            <>
              <span style={{ color: "#04BD88" }} className="font-bold">
                -{p.discount_percentage}%
              </span>
              <span className="text-gray-400 font-medium"> • </span>
            </>
          )}

          <span className="font-bold text-black">
            {Math.round(discountedPrice)} USD
          </span>

          {p.previous_price && (
            <>
              <span className="text-gray-400 font-medium"> • </span>
              <span className="font-medium text-gray-500 line-through">
                $ {Math.round(p.previous_price)} USD
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
