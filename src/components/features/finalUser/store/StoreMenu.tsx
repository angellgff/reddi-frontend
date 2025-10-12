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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BasicInput
          id="search"
          label="Buscar productos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
          className="md:col-span-2"
        />
        <div className="flex items-end">
          <div className="flex gap-2 flex-wrap">
            <TagsTabs
              tags={[{ value: "", label: "Todos" }, ...menu.categories]}
              selectedCategoryId={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No hay productos que coincidan con los filtros.
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="space-y-3">
            <h2 className="text-lg font-semibold">{group.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.products.map((p) => (
                <div
                  key={p.id}
                  className="border border-[#D9DCE3] rounded-xl p-3 hover:shadow-sm transition-shadow"
                >
                  {p.image_url ? (
                    <div className="relative w-full h-28 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-28 bg-gray-100 rounded-lg mb-2" />
                  )}
                  <div className="space-y-1">
                    <p className="font-medium">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        $
                        {(p.discount_percentage
                          ? p.base_price * (1 - p.discount_percentage / 100)
                          : p.base_price
                        ).toFixed(2)}
                      </span>
                      {p.previous_price && (
                        <span className="text-xs text-gray-400 line-through">
                          ${p.previous_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      className="mt-2 w-full bg-primary text-white text-sm py-2 rounded-lg"
                      onClick={() => handleAddToCart(p)}
                      disabled={isPending}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
