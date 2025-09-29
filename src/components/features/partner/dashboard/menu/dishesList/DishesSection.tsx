"use client";

import Spinner from "@/src/components/basics/Spinner";
import { useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect } from "react"; // Importa useEffect
import Link from "next/link";
import DishItem from "./DishItem";
import { DishData } from "@/src/lib/partner/dashboard/type";
import SearchInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import TagsTabs from "@/src/components/features/partner/TagsTabs";
import SearchPartnerIcon from "@/src/components/icons/SearchPartnerIcon";

type DishesListProps = {
  dishes: DishData[];
  categories: { value: string; label: string }[];
  tags: { value: string; label: string }[];
};

export default function DishesSection({
  dishes,
  categories,
  tags,
}: DishesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Los estados locales que controlan los inputs
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");

  useEffect(() => {
    // Usamos un timeout para "debounce" la búsqueda y no actualizar la URL en cada tecleo.
    const debounceTimer = setTimeout(() => {
      // Creamos una copia de los parámetros de búsqueda actuales
      const params = new URLSearchParams(searchParams.toString());

      // Actualizamos el parámetro 'q' (búsqueda de texto)
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q"); // Si el input está vacío, eliminamos el parámetro de la URL
      }

      // Actualizamos el parámetro 'category'
      if (selectedCategory) {
        params.set("category", selectedCategory);
      } else {
        params.delete("category");
      }

      // Actualizamos el parámetro 'tag'
      if (selectedTag) {
        params.set("tag", selectedTag);
      } else {
        params.delete("tag");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(debounceTimer);
  }, [query, selectedCategory, selectedTag]);

  const handleDeleteDish = (id: string) => {
    console.log("Eliminando plato con ID:", id);
    // Aquí podrías añadir lógica para refrescar los datos si es necesario
  };

  return (
    <>
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <h1 className="font-semibold text-gray-800 font-montserrat">
          Lista de platillos
        </h1>
        <Link
          href="menu/nuevo"
          className="px-8 py-2 text-center text-white bg-primary rounded-xl hover:bg-teal-600 transition-colors font-medium text-sm"
        >
          Añadir Nuevo Menú / Plato
        </Link>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <SearchInput
          id="search"
          label="Menú / platos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:col-span-2"
          icon={<SearchPartnerIcon />}
          disabled={isPending}
        />
        <SelectInput
          id="category"
          label="Categoría"
          options={categories}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={isPending}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <TagsTabs
          tags={tags}
          selectedCategoryId={selectedTag}
          onSelectCategory={isPending ? () => {} : setSelectedTag}
          disabled={isPending}
        />
      </div>

      {/* Grid de Platos */}

      {isPending ? (
        <div className="flex items-center justify-center h-72">
          <Spinner />
        </div>
      ) : dishes.length === 0 ? (
        <div className="flex items-center justify-center h-72">
          <p className="text-gray-500">
            No se encontraron platillos, verifique los filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 mt-4">
          {dishes.map((dish) => (
            <DishItem key={dish.id} dish={dish} onDelete={handleDeleteDish} />
          ))}
        </div>
      )}
    </>
  );
}
