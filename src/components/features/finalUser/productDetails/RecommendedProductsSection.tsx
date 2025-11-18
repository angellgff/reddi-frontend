"use client";

import React, { useMemo, useRef } from "react";
import Link from "next/link";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/src/components/icons/ArrowRightIcon";
import ProductCardRestaurant, {
  ProductCardBase,
} from "@/src/components/features/finalUser/store/productCards/ProductCardRestaurant";
import ProductCardMarket from "@/src/components/features/finalUser/store/productCards/ProductCardMarket";
import type { RecommendedProduct } from "@/src/lib/finalUser/stores/getRecommendedProducts";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { addItem } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";
import { useRouter } from "next/navigation";

type PartnerType =
  | "market"
  | "restaurant"
  | "liquor_store"
  | string
  | undefined;

export default function RecommendedProductsSection({
  products,
  partnerId,
  partnerType,
  currentProductId,
}: {
  products: RecommendedProduct[];
  partnerId: string;
  partnerType?: PartnerType;
  currentProductId?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isRestaurant = partnerType === "restaurant";

  const cards: (ProductCardBase & { discountedPrice: number })[] = useMemo(
    () =>
      products.map((p) => {
        const base = Number(p.base_price) || 0;
        const d = p.discount_percentage ? Number(p.discount_percentage) : 0;
        const discountedPrice = d ? base * (1 - d / 100) : base;
        return {
          id: p.id,
          name: p.name,
          image_url: p.image_url,
          base_price: p.base_price,
          previous_price: p.previous_price,
          description: p.description,
          discount_percentage: p.discount_percentage,
          discountedPrice,
        } as ProductCardBase & { discountedPrice: number };
      }),
    [products]
  );

  const onAdd = (product: ProductCardBase, e: React.MouseEvent) => {
    e.stopPropagation();
    const base = Number(product.base_price) || 0;
    const d = product.discount_percentage
      ? Number(product.discount_percentage)
      : 0;
    const unit = d ? base * (1 - d / 100) : base;
    dispatch(
      addItem({
        productId: product.id,
        partnerId,
        name: product.name,
        imageUrl: product.image_url,
        unitPrice: Number(unit.toFixed(2)),
        quantity: 1,
        extras: [],
        mergeByProduct: true,
      })
    );
    dispatch(openCart());
  };

  const onOpen = (product: ProductCardBase) => {
    if (product.id === currentProductId) return; // already on it
    router.push(`/user/stores/${partnerId}/product/${product.id}`);
  };

  return (
    <section className="w-full max-w-6xl mx-auto mt-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2 md:px-0">
        <h3 className="text-[20px] md:text-[28px] font-semibold text-black leading-6 md:leading-8">
          Producto recomendados
        </h3>
        <div className="flex items-center gap-6">
          <Link
            href={`/user/stores/${partnerId}`}
            className="hidden md:flex text-[16px] underline text-black"
          >
            Mostrar todo
          </Link>
          <div className="flex items-center gap-1">
            <button
              aria-label="Anterior"
              className="w-9 h-9 rounded-full bg-[#F6F6F6] grid place-items-center"
              onClick={() =>
                scrollerRef.current?.scrollBy({
                  left: -320,
                  behavior: "smooth",
                })
              }
            >
              <ArrowLeftIcon />
            </button>
            <button
              aria-label="Siguiente"
              className="w-9 h-9 rounded-full bg-[#04BD88] grid place-items-center"
              onClick={() =>
                scrollerRef.current?.scrollBy({ left: 320, behavior: "smooth" })
              }
            >
              <ArrowRightIcon fill="#FFFFFF" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile link under header */}
      <div className="px-2 mt-2 md:hidden">
        <Link
          href={`/user/stores/${partnerId}`}
          className="mx-auto flex w-fit text-[16px] underline text-black"
        >
          Mostrar todo
        </Link>
      </div>

      {/* List */}
      <div className="mt-3">
        <div
          ref={scrollerRef}
          className="flex gap-[30px] overflow-x-auto scroll-smooth px-2 md:px-0 scrollbar-none"
        >
          {cards.map((p) => (
            <div key={p.id} className="flex-none min-w-[153px]">
              {isRestaurant ? (
                <ProductCardRestaurant
                  product={p}
                  discountedPrice={(p as any).discountedPrice}
                  onAdd={onAdd}
                  onOpen={onOpen}
                />
              ) : (
                <ProductCardMarket
                  product={p}
                  discountedPrice={(p as any).discountedPrice}
                  onAdd={onAdd}
                  onOpen={onOpen}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
