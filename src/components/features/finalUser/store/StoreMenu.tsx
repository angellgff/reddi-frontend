"use client";

import React, { useEffect, useState, useTransition } from "react";
import type { StoreMenu as StoreMenuType } from "@/src/lib/finalUser/stores/getStoreMenu";
import BasicInput from "@/src/components/basics/BasicInput";
import TagsTabs from "@/src/components/features/partner/TagsTabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function StoreMenu({ menu }: { menu: StoreMenuType }) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

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
  }, [query, selectedCategory]);

  const groups = menu.groups;

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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-28 object-cover rounded-lg mb-2"
                    />
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
                        ${p.base_price.toFixed(2)}
                      </span>
                      {p.previous_price && (
                        <span className="text-xs text-gray-400 line-through">
                          ${p.previous_price.toFixed(2)}
                        </span>
                      )}
                    </div>
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
