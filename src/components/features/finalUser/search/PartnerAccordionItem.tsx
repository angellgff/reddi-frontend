"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronDown, Plus, Star } from "lucide-react";
import Link from "next/link";
import { SearchResultPartner } from "@/src/lib/finalUser/search/searchPartners";
import { formatCurrency } from "@/src/lib/utils";

interface PartnerAccordionItemProps {
  partner: SearchResultPartner;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PartnerAccordionItem({
  partner,
  isOpen,
  onToggle,
}: PartnerAccordionItemProps) {
  // Mock promotional badge logic based on ID to be deterministic
  const discount =
    partner.id.charCodeAt(0) % 3 === 0 ? "10% off en RD$3,500+" : null;

  return (
    <div className="border-b border-gray-100 last:border-0 py-4">
      {/* Header Row */}
      <div
        className="flex items-center justify-between px-4 pb-2"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Logo */}
          <div className="w-[50px] h-[50px] relative rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
            <Image
              src={partner.imageUrl || "/placeholder.png"}
              alt={partner.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h3 className="text-[17px] font-bold text-[#292D32] leading-tight font-[Open Sans]">
              {partner.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-green-500 text-xs">⚡</span>
              <span className="text-[13px] font-semibold text-gray-700 font-[Open Sans]">
                Rapid {partner.deliveryTime || "41min"}
              </span>
            </div>
            {discount && (
              <div className="mt-1">
                <span className="bg-red-50 text-red-500 text-[10px] px-1.5 py-0.5 rounded font-medium">
                  {discount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle / Arrow */}
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {isOpen ? (
            <ChevronDown size={18} className="text-black" />
          ) : (
            <ChevronRight size={18} className="text-black" />
          )}
        </button>
      </div>

      {/* Expanded Content: Products */}
      {isOpen && (
        <div className="mt-3 pl-4 overflow-x-auto no-scrollbar">
          {partner.products?.length > 0 ? (
            <div className="flex gap-4 pr-4">
              {partner.products.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[140px] w-[140px] flex flex-col items-center"
                >
                  {/* Product Card */}
                  <div className="relative w-full aspect-[4/3] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-2">
                    <Image
                      src={product.image_url || "/food-placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {/* Add Button */}
                    <button className="absolute bottom-2 right-2 w-6 h-6 bg-[#04BD88] rounded flex items-center justify-center text-white">
                      <Plus size={14} strokeWidth={3} />
                    </button>
                    {/* Rating Badge Mock */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 shadow-sm">
                      <Star
                        size={8}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span>4.8</span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="w-full text-left">
                    <span className="block font-bold text-[13px] text-black leading-tight mb-0.5 truncate w-full">
                      {formatCurrency(
                        product.display_price ?? product.base_price
                      )}
                    </span>
                    <span className="block text-[11px] text-gray-500 leading-tight line-clamp-2 h-[28px]">
                      {product.name}
                    </span>
                    {/* Badge Mock - Using deterministic ID check */}
                    {product.id.charCodeAt(0) % 2 === 0 && (
                      <span className="inline-block mt-1 bg-green-50 text-emerald-600 text-[9px] px-1.5 py-[1px] rounded-full font-medium">
                        Many in Stock
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* View More Link Card */}
              <Link
                href={partner.href}
                className="min-w-[100px] flex flex-col items-center justify-center gap-2 text-gray-500"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <ChevronRight />
                </div>
                <span className="text-xs font-medium">Ver todo</span>
              </Link>
            </div>
          ) : (
            <div className="px-4 text-sm text-gray-500 py-2">
              No hay productos destacados.
              <Link
                href={partner.href}
                className="text-emerald-600 ml-1 font-medium underline"
              >
                Ver tienda
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
