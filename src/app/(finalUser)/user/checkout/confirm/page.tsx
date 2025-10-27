"use client";

import Link from "next/link";
import Stepper from "@/src/components/features/finalUser/checkout/Stepper";
import { useAppSelector } from "@/src/lib/store/hooks";
import { selectCartItems, selectCartSubtotal } from "@/src/lib/store/cartSlice";
import {
  selectServiceFee,
  selectShippingFee,
} from "@/src/lib/store/chargesSlice";

function currency(n: number) {
  if (!isFinite(n)) return "$0.00";
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export default function CheckoutConfirmPage() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingFee);
  const serviceFee = useAppSelector(selectServiceFee);
  const checkout = useAppSelector((s) => s.checkout);

  const discount = (subtotal * checkout.discountPct) / 100;
  const tip = (subtotal * checkout.tipPercent) / 100;
  const total = Math.max(0, subtotal - discount) + shipping + serviceFee + tip;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Stepper current="confirmar" />

      <section className="rounded-2xl border border-[#D9DCE3] bg-white p-[30px]">
        <h2 className="text-center text-[28px] leading-8 font-semibold text-[#0D0D0D]">
          Resumen final
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-[21px]">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Ítems</span>
              <span className="text-right">{items.length} productos</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total</span>
              <span className="text-right">{currency(total)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Tipo de lugar</span>
              <span className="text-right capitalize">
                {checkout.placeType || "—"}
              </span>
            </div>
            <div className="flex items-start justify-between text-sm">
              <span className="font-medium">
                Instrucciones especiales para la entrega
              </span>
              <span className="max-w-[60%] text-right leading-5">
                {checkout.instructions || "—"}
              </span>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Entrega</span>
              <span className="text-right">
                {checkout.schedule.mode === "now" ? (
                  "ahora"
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#E7EFFF] px-3 py-0.5 text-[12px] leading-4 font-medium text-[#292929]">
                    <span className="h-2 w-2 rounded-full bg-[#3762E2]" />
                    programado
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Fecha y hora</span>
              <span className="text-right">
                {checkout.schedule.mode === "now"
                  ? "—"
                  : `${(checkout.schedule as any).date}, ${
                      (checkout.schedule as any).time
                    }`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Pago</span>
              <span className="text-right">
                {checkout.payment
                  ? `Tarjeta •••• ${checkout.payment.last4}`
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-6 flex items-center justify-between">
        <Link
          href="/user/checkout/address"
          className="h-10 rounded-xl border px-4 text-sm flex justify-center items-center"
        >
          Volver
        </Link>
        <Link
          href="/user/orders"
          className="h-10 rounded-xl bg-emerald-600 px-4 text-sm text-white flex justify-center items-center"
        >
          Seguir tu pedido
        </Link>
      </div>
    </div>
  );
}
