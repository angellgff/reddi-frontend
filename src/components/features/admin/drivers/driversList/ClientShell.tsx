"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { OrderDir } from "@/src/lib/admin/type";
import TableHeader from "./TableHeader";

export interface ClientShellProps {
  totalCount: number;
  tableBody: React.ReactNode;
}

const ITEMS_PER_PAGE = 10;

export default function DriversClientShell({
  totalCount,
  tableBody,
}: ClientShellProps) {
  const formattedTotal = new Intl.NumberFormat("es-CO").format(totalCount);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set("q", query);
    else params.delete("q");
    startTransition(() =>
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    );
  }, [query, searchParams, router, pathname]);

  const handleClearFilters = useCallback(() => {
    setQuery("");
    startTransition(() => router.push(pathname, { scroll: false }));
  }, [router, pathname]);

  const currentSortBy = searchParams.get("orderBy") || null;
  const currentSortDirection = (searchParams.get("order") as OrderDir) || null;
  const handleSort = useCallback(
    (columnKey: any) => {
      const params = new URLSearchParams(searchParams);
      let nextOrderDirection: OrderDir | null;
      if (currentSortBy !== columnKey) nextOrderDirection = "asc";
      else
        nextOrderDirection =
          currentSortDirection === "asc"
            ? "desc"
            : currentSortDirection === "desc"
            ? null
            : "asc";
      if (nextOrderDirection) {
        params.set("orderBy", columnKey);
        params.set("order", nextOrderDirection);
      } else {
        params.delete("orderBy");
        params.delete("order");
      }
      startTransition(() =>
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      );
    },
    [searchParams, router, pathname, currentSortBy, currentSortDirection]
  );

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(newPage));
      startTransition(() =>
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      );
    },
    [searchParams, router, pathname]
  );

  return (
    <>
      {/* Simplified filters to match customers pattern */}
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-[#1F2937] font-montserrat font-semibold">
          Filtros
        </h3>
        <div className="mt-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <label className="text-sm text-[#292929] font-medium">Nombre</label>
            <div className="flex items-center gap-2 border border-[#D9DCE3] rounded-xl px-4 h-10">
              <input
                className="flex-1 outline-none text-sm"
                placeholder="Buscar por nombre, correo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 rounded-xl border border-[#202124] bg-white text-[#202124] text-sm"
              onClick={handleClearFilters}
              disabled={isPending}
            >
              Limpiar filtros
            </button>
            <button
              className="px-5 py-2 rounded-xl bg-[#04BD88] text-white text-sm"
              onClick={handleFilter}
              disabled={isPending}
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg overflow-hidden mt-6 px-6">
        <div className="py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800 font-montserrat">
            Lista de Repartidores
          </h1>
          <span className="text-sm text-[#6A6C71] font-roboto">
            {formattedTotal} repartidores encontrados
          </span>
        </div>
        <div className="overflow-x-auto border border-[#D9DCE3] rounded-xl">
          <table className="w-full text-center">
            <TableHeader
              currentSortBy={currentSortBy}
              currentSortDirection={currentSortDirection}
              onSort={isPending ? () => {} : handleSort}
            />
            {tableBody}
          </table>
        </div>
        <div className="p-4 flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-700">
            {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)} -{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={isPending || currentPage <= 1}
            >
              Anterior
            </button>
            <span className="text-sm">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() =>
                handlePageChange(Math.min(totalPages || 1, currentPage + 1))
              }
              disabled={isPending || currentPage >= (totalPages || 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
