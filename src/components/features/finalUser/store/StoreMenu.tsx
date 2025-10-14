"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import type { StoreMenu as StoreMenuType } from "@/src/lib/finalUser/stores/getStoreMenu";
import Image from "next/image";
import BasicInput from "@/src/components/basics/BasicInput";
import TagsTabs from "@/src/components/features/partner/TagsTabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { addItem } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";
import { useRouter as useNextRouter } from "next/navigation";

export default function StoreMenu({ menu }: { menu: StoreMenuType }) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const nav = useNextRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      if (selectedCategory) params.set("category", selectedCategory);
      else params.delete("category");
      startTransition(() =>
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      );
    }, 250);
    return () => clearTimeout(t);
  }, [
    query,
    selectedCategory,
    searchParams,
    router,
    pathname,
    startTransition,
  ]);

  const groups = menu.groups;

  // partnerId from pathname: /user/stores/[id]
  const partnerId = useMemo(() => {
    const parts = pathname?.split("/") || [];
    const idx = parts.findIndex((p) => p === "stores");
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "";
  }, [pathname]);

  type ProductCard = StoreMenuType["groups"][number]["products"][number];
  const handleAddToCart = (p: ProductCard) => {
    const base = Number(p.base_price) || 0;
    const discount = p.discount_percentage ? Number(p.discount_percentage) : 0;
    const unit = discount ? base * (1 - discount / 100) : base;
    dispatch(
      addItem({
        productId: p.id,
        partnerId,
        name: p.name,
        imageUrl: p.image_url,
        unitPrice: Number(unit.toFixed(2)),
        quantity: 1,
        extras: [],
        mergeByProduct: true,
      })
    );
    dispatch(openCart());
  };

  const openDetails = (p: ProductCard) => {
    // navigate to /user/stores/[id]/product/[productId]
    if (!partnerId) return;
    nav.push(`/user/stores/${partnerId}/product/${p.id}`);
  };

  return (
    <div className="space-y-8">
      {/* Search + Categories Bar */}
      <div className="space-y-4">
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto scrollbar-none py-2">
            <TagsTabs
              tags={[{ value: "", label: "Todos" }, ...menu.categories]}
              selectedCategoryId={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
              disabled={isPending}
            />
          </div>
        </div>
        {/* Offer banner placeholder */}
        <div className="rounded-lg bg-emerald-700 text-white px-5 py-3 flex items-center justify-between">
          <div className="text-sm font-medium">
            ¡Oferta especial hoy! Disfruta 25% Off 2 Presas De Pollo. Aplican
            T&C
          </div>
          <button className="text-xs font-semibold bg-white text-emerald-700 px-3 py-1 rounded-md hover:bg-gray-100">
            Ver detalles
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No hay productos que coincidan con los filtros.
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="space-y-4">
            <h2 className="text-xl font-semibold">{group.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {group.products.map((p) => {
                const discounted = p.discount_percentage
                  ? p.base_price * (1 - p.discount_percentage / 100)
                  : p.base_price;
                return (
                  <div
                    key={p.id}
                    className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                    onClick={() => openDetails(p)}
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
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            ${discounted.toFixed(2)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                          }}
                          disabled={isPending}
                        >
                          Agregar al carrito
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
