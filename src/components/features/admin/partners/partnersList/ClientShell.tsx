"use client";

import RestaurantListSkeleton from "@/src/components/features/admin/partners/partnersList/RestaurantListSkeleton";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { OrderDir, Sortables } from "@/src/lib/admin/type";
import FiltersSection from "./FiltersSection";
import PaginButtons from "./PaginButtons";
import TableHeader from "./TableHeader";

const ITEMS_PER_PAGE = 5; // Número de ítems por página

export interface ClientShellProps {
  totalCount: number;
  tableBody: React.ReactNode;
}

const businessSelect = [
  { value: "res", label: "Restaurante" },
  { value: "caf", label: "Cafetería" },
];

const stateSelect = [
  { value: "open", label: "Activo" },
  { value: "closed", label: "Inactivo" },
];

export default function ClientShell({
  tableBody,
  totalCount,
}: ClientShellProps) {
  const formattedTotal = new Intl.NumberFormat("es-CO").format(totalCount);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  // LÓGICA PARA FILTROS
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [state, setState] = useState(searchParams.get("state") || "");

  // Prepara la nueva URL con los filtros aplicados y navega a ella
  const handleFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set("q", query);
    else params.delete("q");
    if (type) params.set("type", type);
    else params.delete("type");
    if (state) params.set("state", state);
    else params.delete("state");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [query, type, state, searchParams, router, pathname]);

  // Limpia los filtros y navega a la URL base
  const handleClearFilters = useCallback(() => {
    setQuery("");
    setType("");
    setState("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [router, pathname]);

  // LÓGICA PARA ORDENACIÓN

  const currentSortBy = searchParams.get("orderBy") || "";
  const currentSortDirection = (searchParams.get("order") as OrderDir) || null;
  const handleSort = useCallback(
    (columnKey: Sortables) => {
      const params = new URLSearchParams(searchParams);
      let nextOrderDirection: OrderDir | null;

      // Lógica para ciclar entre "asc", "desc", null
      if (currentSortBy !== columnKey) {
        nextOrderDirection = "asc";
      } else {
        nextOrderDirection =
          currentSortDirection === "asc"
            ? "desc"
            : currentSortDirection === "desc"
            ? null
            : "asc";
      }

      // Si la ordenación se desactiva, eliminamos los parámetros para una URL limpia
      if (nextOrderDirection) {
        params.set("orderBy", columnKey);
        params.set("order", nextOrderDirection);
      } else {
        params.delete("orderBy");
        params.delete("order");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname, currentSortBy, currentSortDirection]
  );

  // LÓGICA PARA PAGINACIÓN
  const currentPage = Number(searchParams.get("page")) || 1;
  // Calculamos el total de páginas basado en el total de ítems
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(newPage));
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname]
  );

  return (
    <>
      {/* 1. SECCIÓN DE FILTROS */}
      <FiltersSection
        businessTypes={businessSelect}
        states={stateSelect}
        queryValue={query}
        typeValue={type}
        stateValue={state}
        onQueryChange={(e) => setQuery(e.target.value)}
        onTypeChange={(e) => setType(e.target.value)}
        onStateChange={(e) => setState(e.target.value)}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
        disabled={isPending}
      />
      {/* 2. CUERPO DE LA SEGUNDA SECCIÓN */}
      <div className="bg-white rounded-lg overflow-hidden mt-6 px-6">
        <div className="py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800 font-montserrat">
            Lista de Usuarios
          </h1>
          <span className="text-sm text-[#6A6C71] font-roboto">
            {formattedTotal} usuarios encontrados
          </span>
        </div>
        {/* 3. TABLA DE RESTAURANTES */}
        <div className="overflow-x-auto border border-[#D9DCE3] rounded-xl">
          {isPending ? (
            <RestaurantListSkeleton />
          ) : (
            <table className="w-full text-center">
              <TableHeader
                currentSortBy={currentSortBy}
                currentSortDirection={currentSortDirection}
                onSort={isPending ? () => {} : handleSort}
              />
              {tableBody}
            </table>
          )}
        </div>
        {/* 4. BOTONES DE PAGINACIÓN */}
        <div className="p-4 flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-700">
            1 - {ITEMS_PER_PAGE} de {totalPages} Páginas
          </p>
          <div className="flex items-center gap-2">
            <PaginButtons
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isPending={isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
}
