"use client";

import React, { useState, useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import BannersStats from "./BannersStats";
import BannersFilter from "./BannersFilter";
import PaginButtons from "@/src/components/features/admin/partners/partnersList/PaginButtons";
import { BannersStatsData } from "@/src/lib/admin/data/banners/getBannersStats";

interface BannersClientShellProps {
  stats: BannersStatsData;
  totalCount: number;
  tableBody: React.ReactNode;
}

const ITEMS_PER_PAGE = 5;

export default function BannersClientShell({
  stats,
  totalCount,
  tableBody,
}: BannersClientShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL state
  const initialFromDate = searchParams.get("fromDate") || "";
  const initialToDate = searchParams.get("toDate") || "";
  const initialStatus = searchParams.get("status") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

  // Local state for inputs
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [status, setStatus] = useState(initialStatus);

  const handleFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    
    if (fromDate) params.set("fromDate", fromDate);
    else params.delete("fromDate");
    
    if (toDate) params.set("toDate", toDate);
    else params.delete("toDate");
    
    if (status) params.set("status", status);
    else params.delete("status");

    // Reset pagination on filter change
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [fromDate, toDate, status, searchParams, router, pathname]);

  const handleClearFilters = useCallback(() => {
    setFromDate("");
    setToDate("");
    setStatus("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [router, pathname]);

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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const formattedTotal = new Intl.NumberFormat("es-CO").format(totalCount);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Section */}
      <BannersStats stats={stats} />

      {/* Filters Section */}
      <BannersFilter
        fromDate={fromDate}
        toDate={toDate}
        status={status}
        onFromDateChange={(e) => setFromDate(e.target.value)}
        onToDateChange={(e) => setToDate(e.target.value)}
        onStatusChange={(e) => setStatus(e.target.value)}
        onFilter={handleFilter}
        onClearFilters={handleClearFilters}
        disabled={isPending}
      />

      {/* Table Section */}
      <div className="bg-white rounded-lg overflow-hidden mt-6 px-6 pb-6">
         <div className="py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800 font-montserrat">
            Banners
          </h1>
          <span className="text-sm text-[#6A6C71] font-roboto">
            {formattedTotal} banners encontrados
          </span>
        </div>

        {isPending ? (
          <div className="w-full h-48 flex items-center justify-center text-gray-400">
             Cargando...
          </div>
        ) : (
          tableBody
        )}

        <div className="p-4 flex items-center justify-between border-t border-gray-200 mt-4">
          <p className="text-sm text-gray-700">
             {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalCount)} -{" "}
             {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
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
    </div>
  );
}
