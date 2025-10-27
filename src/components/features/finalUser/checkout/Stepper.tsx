"use client";

import React from "react";

export type CheckoutStep = "pago" | "direccion" | "confirmar";

const steps: { key: CheckoutStep; label: string }[] = [
  { key: "pago", label: "Pago" },
  { key: "direccion", label: "Dirección" },
  { key: "confirmar", label: "Confirmar" },
];

export default function Stepper({ current }: { current: CheckoutStep }) {
  const currentIndex = steps.findIndex((s) => s.key === current);
  return (
    <div className="mb-6 mx-auto w-full max-w-[672px] isolate">
      {/* Separator line behind dots */}
      <div className="absolute left-0 right-0 top-[28px] border-t-2 border-gray-200 z-0" />

      <div className="relative z-10 flex w-full items-center justify-between gap-5 text-[16px] leading-4">
        {steps.map((s, i) => {
          const completed = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={s.key}
              className="flex flex-1 flex-col items-center justify-center gap-3"
            >
              <span className="font-medium text-[#04BD88]">{s.label}</span>
              <span
                className={
                  completed
                    ? "h-4 w-4 rounded-full bg-[#04BD88]"
                    : isCurrent
                    ? "h-4 w-4 rounded-full border border-[#04BD88] bg-white"
                    : "h-4 w-4 rounded-full border border-gray-300 bg-white"
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
