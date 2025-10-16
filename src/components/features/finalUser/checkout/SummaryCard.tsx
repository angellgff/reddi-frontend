"use client";

import React from "react";

function currency(n: number) {
  if (!isFinite(n)) return "$0.00";
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export default function SummaryCard({
  rows,
  total,
  cta,
  disabled,
}: {
  rows: Array<{ label: string; value: number; negative?: boolean }>;
  total: number;
  cta: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="font-semibold mb-3">Resumen del pedido</div>
      {rows.map((r, idx) => (
        <Row
          key={idx}
          label={r.label}
          value={`${r.negative ? "- " : ""}${currency(r.value)}`}
        />
      ))}
      <div className="my-3 border-t" />
      <Row label="Total" value={currency(total)} bold />
      <div className={disabled ? "opacity-60 pointer-events-none" : ""}>
        {cta}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={bold ? "font-semibold" : "text-gray-600"}>{label}</span>
      <span className={bold ? "font-semibold" : "text-gray-900"}>{value}</span>
    </div>
  );
}
