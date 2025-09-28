"use client";

import React from "react";
import OnNextIcon from "@/src/components/icons/OnNextIcon";
import OnPrevIcon from "@/src/components/icons/OnPrevIcon";

type PaginButtonsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  isPending: boolean;
};

export default function PaginButtons({
  currentPage,
  totalPages,
  onPageChange,
  isPending,
}: PaginButtonsProps) {
  const handlePrevious = () => {
    // No permitir cambiar de página si ya está en una transición o si es la primera página
    if (!isPending && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isPending && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <>
      <span className="text-sm text-gray-700">Página</span>
      <button className="px-3 py-1 border border-[#B0B0B0] rounded-md text-sm cursor-default">
        {currentPage}
      </button>
      <div className="flex gap-1">
        <button
          onClick={handlePrevious}
          // Se desactiva si está pendiente O si es la primera página
          disabled={isPending || currentPage <= 1}
          className="p-1 border border-[#B0B0B0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Ir a la página anterior"
        >
          <OnPrevIcon />
        </button>
        <button
          onClick={handleNext}
          // Se desactiva si está pendiente O si es la última página
          disabled={isPending || currentPage >= totalPages}
          className="p-1 border border-[#B0B0B0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Ir a la página siguiente"
        >
          <OnNextIcon />
        </button>
      </div>
    </>
  );
}
