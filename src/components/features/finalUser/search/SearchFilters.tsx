"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const PARTNER_TYPES = [
  { value: "restaurant", label: "Restaurantes" },
  { value: "market", label: "Mercados" },
  { value: "liquor_store", label: "Licores" },
  { value: "pharmacy", label: "Farmacias" },
  { value: "tobacco", label: "Tabaco" },
];

const SORT_OPTIONS = [
  { value: "", label: "Relevancia" },
  { value: "rating_desc", label: "Mejor Calificados" },
  { value: "reviews_desc", label: "Más Populares" },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const toggleType = useCallback(
    (type: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentTypes = params.get("type")?.split(",") || [];
      
      let newTypes;
      if (currentTypes.includes(type)) {
        newTypes = currentTypes.filter((t) => t !== type);
      } else {
        newTypes = [...currentTypes, type];
      }

      if (newTypes.length > 0) {
        params.set("type", newTypes.join(","));
      } else {
        params.delete("type");
      }
      
      router.push("?" + params.toString());
    },
    [searchParams, router]
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push("?" + createQueryString("sort", e.target.value));
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(
      "?" + createQueryString("minRating", e.target.checked ? "4" : "")
    );
  };

  return (
    <div className="flex flex-col gap-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      {/* Sort */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-gray-900">Ordenar por</h3>
        <select
          className="w-full text-sm border-gray-200 rounded-lg focus:border-green-500 focus:ring-green-500"
          value={searchParams.get("sort") || ""}
          onChange={handleSortChange}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-gray-900">Categorías</h3>
        <div className="space-y-2">
          {PARTNER_TYPES.map((type) => {
            const isChecked = (searchParams.get("type")?.split(",") || []).includes(
              type.value
            );
            return (
              <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleType(type.value)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">{type.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-gray-900">Calificación</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.get("minRating") === "4"}
            onChange={handleRatingChange}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-600">4+ Estrellas</span>
        </label>
      </div>
    </div>
  );
}
