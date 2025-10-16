"use client";

import { useMemo, useState } from "react";
import { useAppSelector } from "@/src/lib/store/hooks";
import { selectCartItems, selectCartSubtotal } from "@/src/lib/store/cartSlice";
import {
  selectServiceFee,
  selectShippingFee,
} from "@/src/lib/store/chargesSlice";
import Link from "next/link";
import Image from "next/image";
import TipSelector from "@/src/components/features/finalUser/checkout/TipSelector";
import SummaryCard from "@/src/components/features/finalUser/checkout/SummaryCard";
import { useStoreDetailsClient } from "@/src/lib/finalUser/stores/useStoreDetailsClient";

function currency(n: number) {
  if (!isFinite(n)) return "$0.00";
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export default function PaymentPage() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingFee);
  const serviceFee = useAppSelector(selectServiceFee);

  // Stores for items in cart
  const partnerIds = useMemo(() => items.map((i) => i.partnerId), [items]);
  const { data: storesMap } = useStoreDetailsClient(partnerIds);
  const firstStore = useMemo(() => {
    for (const id of partnerIds) {
      const s = storesMap?.[id];
      if (s) return s;
    }
    return null;
  }, [partnerIds, storesMap]);

  // Tip/propina (% of subtotal)
  const [tipPercent, setTipPercent] = useState<number>(9);
  const tip = useMemo(
    () => (subtotal * tipPercent) / 100,
    [subtotal, tipPercent]
  );

  // Simple coupon demo: REDDI10 => 10% descuento del subtotal
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discountPct, setDiscountPct] = useState<number>(0);
  const discount = useMemo(
    () => (subtotal > 0 ? (subtotal * discountPct) / 100 : 0),
    [subtotal, discountPct]
  );

  const total = Math.max(0, subtotal - discount) + shipping + serviceFee + tip;

  const validateCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setCouponMsg("Ingresa un cupón válido");
      setDiscountPct(0);
      return;
    }
    if (code === "REDDI10") {
      setDiscountPct(10);
      setCouponMsg("Cupón aplicado: 10% de descuento");
    } else {
      setDiscountPct(0);
      setCouponMsg("Cupón inválido");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Stepper (simple) */}
      <div className="mb-6 flex items-center justify-center gap-10 text-sm text-gray-600">
        <Step active>Pago</Step>
        <Step>Dirección</Step>
        <Step>Confirmar</Step>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Address + Store Card */}
          <section className="rounded-2xl border bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500">
                  Naco– apartamento 3A
                </div>
                <div className="text-[11px] text-gray-400">Puertón rojo</div>
              </div>
              <button className="h-8 rounded-lg border px-3 text-xs">
                Cambiar
              </button>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 grid place-items-center">
                {firstStore?.image_url ? (
                  <Image
                    src={firstStore.image_url}
                    alt={firstStore.name}
                    width={40}
                    height={40}
                    className="object-cover h-10 w-10"
                  />
                ) : (
                  <div className="text-xs text-gray-500">店</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {firstStore?.name || "Tienda"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {firstStore?.address || "Sin dirección"}
                </div>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {items.length} producto(s)
              </div>
            </div>

            {/* Payment method selector (placeholder) */}
            <div className="mt-4 rounded-xl border p-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">Tarjeta Visa ·•••2893</div>
                <div className="text-xs text-gray-500">Pepito Nuñez</div>
              </div>
              <button className="h-8 rounded-lg border px-3 text-xs">
                Cambiar
              </button>
            </div>

            {/* Coupon */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Ingresar cupón"
                className="sm:col-span-2 h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={validateCoupon}
                className="h-10 rounded-xl bg-emerald-600 text-white text-sm font-medium"
              >
                Validar
              </button>
            </div>
            {couponMsg ? (
              <div className="mt-1 text-xs text-gray-600">{couponMsg}</div>
            ) : null}

            {/* Tip selector */}
            <div className="mt-5">
              <div className="text-sm font-medium">
                Gratificación para el conductor
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Considera dejar una gratificación adicional al conductor para
                reconocer su arduo trabajo y dedicación.
              </p>
              <div className="mt-3">
                <TipSelector value={tipPercent} onChange={setTipPercent} />
              </div>
            </div>
          </section>
        </div>

        {/* Right column: summary */}
        <aside className="lg:col-span-4">
          <SummaryCard
            rows={[
              { label: "Costo de productos", value: subtotal },
              ...(discount > 0
                ? [{ label: "Descuento", value: discount, negative: true }]
                : []),
              { label: "Costo de envío", value: shipping },
              { label: "Tarifa de servicio", value: serviceFee },
              { label: "Propina", value: tip },
            ]}
            total={total}
            disabled={items.length === 0}
            cta={
              <Link
                href="/user/address"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-white text-sm font-medium"
              >
                Proceder
              </Link>
            }
          />
        </aside>
      </div>
    </div>
  );
}

function Step({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full border ${
          active ? "bg-emerald-600 border-emerald-600" : "bg-white"
        }`}
      />
      <span className={active ? "text-emerald-700 font-medium" : ""}>
        {children}
      </span>
    </div>
  );
}

// Local-only tiny Step component; summary moved out
