"use client";

import React from "react";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/src/components/icons/ArrowRightIcon";

export default function HorizontalScrollButtons({
  targetId,
  className,
  amount,
}: {
  targetId: string;
  className?: string;
  amount?: number;
}) {
  const scrollByAmount = (dir: -1 | 1) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const page = amount ?? Math.max(el.clientWidth * 0.9, 240);
    el.scrollBy({ left: dir * page, behavior: "smooth" });
  };

  return (
    <div className={`hidden md:flex items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
        aria-label="Desplazar a la izquierda"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        className="flex w-9 h-9 rounded-full bg-emerald-500 items-center justify-center border border-gray-300  text-gray-700 hover:bg-gray-50 shadow-sm"
        aria-label="Desplazar a la derecha"
      >
        <ArrowRightIcon fill="#FFFFFF" />
      </button>
    </div>
  );
}
