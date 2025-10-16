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
    <div className="mb-6 flex items-center justify-center gap-10 text-sm text-gray-600">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full border ${
              i <= currentIndex
                ? "bg-emerald-600 border-emerald-600"
                : "bg-white"
            }`}
          />
          <span
            className={i === currentIndex ? "text-emerald-700 font-medium" : ""}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
