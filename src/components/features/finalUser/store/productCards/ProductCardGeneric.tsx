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

export default function ProductCardGeneric({
  product: p,
  discountedPrice,
  isPending,
  onAdd,
  onOpen,
}: Props) {
  return (
    <div
      className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col"
      onClick={() => onOpen(p)}
    >
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        ) : null}
        {p.discount_percentage ? (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm">
            -{p.discount_percentage}%
          </span>
        ) : null}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
          {p.name}
        </p>
        {p.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
        )}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-900">
              ${discountedPrice.toFixed(2)}
            </span>
            {p.previous_price && (
              <span className="text-xs text-gray-400 line-through">
                ${p.previous_price.toFixed(2)}
              </span>
            )}
          </div>
          {p.discount_percentage ? (
            <div className="text-[11px] text-red-600 font-semibold">
              Ahorra {p.discount_percentage}%
            </div>
          ) : null}
          <button
            className="mt-2 w-full bg-primary text-white text-xs py-2 rounded-lg font-medium hover:bg-primary/90"
            onClick={(e) => onAdd(p, e)}
            disabled={isPending}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
