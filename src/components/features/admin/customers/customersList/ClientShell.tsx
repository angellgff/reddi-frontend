"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { OrderDir } from "@/src/lib/admin/type";
import FiltersSection from "./FiltersSection";
import TableHeader from "./TableHeader";

export interface ClientShellProps {
  totalCount: number;
  tableBody: React.ReactNode;
}

const ITEMS_PER_PAGE = 10;

export default function ClientsClientShell({
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
      <FiltersSection
        queryValue={query}
        onQueryChange={(e) => setQuery(e.target.value)}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
        disabled={isPending}
      />
      <div className="bg-white rounded-lg overflow-hidden mt-6 px-6">
        <div className="py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800 font-montserrat">
            Lista de Usuarios
          </h1>
          <span className="text-sm text-[#6A6C71] font-roboto">
            {formattedTotal} usuarios encontrados
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
