"use client";

import { useState } from "react";

const VALID_STATUSES = [
  "pending",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

interface Props {
  orderId: string;
  initialStatus: OrderStatus;
  onStatusChange?: (s: OrderStatus) => void;
}

export default function OrderStatusControls({
  orderId,
  initialStatus,
  onStatusChange,
}: Props) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function updateStatus(newStatus: OrderStatus) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const resp = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(payload?.error || "Error cambiando estado");
      }
      setStatus(payload.order.status as OrderStatus);
      setSuccess(true);
      onStatusChange?.(payload.order.status as OrderStatus);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e ?? "");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 p-4 border rounded-xl bg-white space-y-3">
      <h3 className="text-sm font-semibold">Estado del pedido</h3>
      <div className="flex flex-wrap gap-2">
        {VALID_STATUSES.map((s) => {
          const active = s === status;
          return (
            <button
              key={s}
              type="button"
              disabled={
                loading || status === "delivered" || status === "cancelled"
              }
              onClick={() => updateStatus(s)}
              className={
                "px-3 py-1.5 text-xs rounded-full border transition " +
                (active
                  ? "border-[#04BD88] bg-[#CDF7E7] text-[#04BD88]"
                  : "border-[#D9DCE3] bg-[#F0F2F5] text-gray-700 hover:border-[#04BD88]") +
                (loading ? " opacity-50" : "")
              }
            >
              {s.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
      {error && <div className="text-xs text-red-600">{error}</div>}
      {success && (
        <div className="text-xs text-green-600">Estado actualizado</div>
      )}
      <div className="text-[11px] text-gray-500">
        {status === "delivered" || status === "cancelled"
          ? "Este pedido está finalizado. No se puede cambiar nuevamente."
          : "Selecciona un estado para actualizar el progreso."}
      </div>
    </div>
  );
}
