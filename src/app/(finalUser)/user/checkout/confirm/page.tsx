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

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-center text-2xl font-semibold">Resumen final</h2>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Items</span>
              <span>{items.length} productos</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span>{currency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tipo de lugar</span>
              <span className="capitalize">{checkout.placeType || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Instrucciones especiales para la entrega</span>
              <span className="max-w-[60%] text-right truncate">
                {checkout.instructions || "—"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Entrega</span>
              <span>
                {checkout.schedule.mode === "now" ? (
                  "ahora"
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    programado
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Fecha y hora</span>
              <span>
                {checkout.schedule.mode === "now"
                  ? "—"
                  : `${(checkout.schedule as any).date}, ${
                      (checkout.schedule as any).time
                    }`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pago</span>
              <span>
                {checkout.payment
                  ? `Tarjeta •••• ${checkout.payment.last4}`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/user/checkout/address"
            className="h-10 rounded-xl border px-4 text-sm"
          >
            Volver
          </Link>
          <Link
            href="/user/orders"
            className="h-10 rounded-xl bg-emerald-600 px-4 text-sm text-white"
          >
            Seguir tu pedido
          </Link>
        </div>
      </section>
    </div>
  );
}
