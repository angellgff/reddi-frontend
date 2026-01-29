"use client";

import { useAppSelector } from "@/src/lib/store/hooks";
import { selectCartSubtotal, selectCartItems } from "@/src/lib/store/cartSlice";
import {
  selectShippingFee,
  selectServiceFee,
} from "@/src/lib/store/chargesSlice";
import { useMemo } from "react";

export default function CartSummary() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = 0; // Se calcula en el checkout
  const serviceFee = useAppSelector(selectServiceFee);
  // Tip percent from global context (Redux checkout slice)
  const tipPercent = useAppSelector((s) => s.checkout.tipPercent);
  const tipAmountManual = useAppSelector((s) => s.checkout.tipAmountManual);
  const tip = useMemo(() => {
    if (tipAmountManual && tipAmountManual > 0) return tipAmountManual;
    return (subtotal * (tipPercent || 0)) / 100;
  }, [subtotal, tipPercent, tipAmountManual]);
  
  // En el carrito solo mostramos subtotal + servicios (si aplica), envío es 0
  const total = subtotal + shipping + serviceFee + tip;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(amount);
  };

  return (
    <div className="space-y-2">
      <Row label="Productos" value={formatCurrency(subtotal)} />
      <Row label="Envío" value={formatCurrency(shipping)} />
      <Row label="Tarifa de servicio" value={formatCurrency(serviceFee)} />
      <Row label="Propina" value={formatCurrency(tip)} />
      <div className="border-t pt-2">
        <Row label="Subtotal" value={formatCurrency(total)} bold />
      </div>
      <a
        href={items.length === 0 ? undefined : "/user/checkout/payment"}
        className={`mt-3 block w-full text-center bg-primary text-white font-medium py-3 rounded-xl ${
          items.length === 0 ? "pointer-events-none opacity-60" : ""
        }`}
      >
        Ir al pago
      </a>
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
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold" : "text-gray-600"}>{label}</span>
      <span className={bold ? "font-semibold" : "text-gray-900"}>{value}</span>
    </div>
  );
}
