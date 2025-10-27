"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { selectCartItems, selectCartSubtotal } from "@/src/lib/store/cartSlice";
import {
  selectServiceFee,
  selectShippingFee,
} from "@/src/lib/store/chargesSlice";
import { fetchUserAddresses } from "@/src/lib/store/addressSlice";
import Stepper from "@/src/components/features/finalUser/checkout/Stepper";
import PaymentMethodsDialog from "@/src/components/features/finalUser/checkout/PaymentMethodsDialog";
import SummaryCard from "@/src/components/features/finalUser/checkout/SummaryCard";
import TipSelector from "@/src/components/features/finalUser/checkout/TipSelector";
import { useStoreDetailsClient } from "@/src/lib/finalUser/stores/useStoreDetailsClient";
import {
  setPayment as setPaymentGlobal,
  setCoupon as setCouponGlobal,
  setTipPercent as setTipGlobal,
} from "@/src/lib/store/checkoutSlice";

export default function CheckoutPaymentPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingFee);
  const serviceFee = useAppSelector(selectServiceFee);
  // Persisted selection from checkout slice
  const storedPayment = useAppSelector((s) => s.checkout.payment) as {
    brand: string;
    last4: string;
    cardholder_name: string | null;
  } | null;

  // addresses for header/store portion
  const { addresses, selectedAddressId, status } = useAppSelector(
    (s) => s.addresses
  );
  useEffect(() => {
    if (status === "idle") dispatch(fetchUserAddresses());
  }, [status, dispatch]);

  const partnerIds = useMemo(() => items.map((i) => i.partnerId), [items]);
  const { data: storesMap } = useStoreDetailsClient(partnerIds);
  const firstStore = useMemo(() => {
    for (const id of partnerIds) {
      const s = storesMap?.[id];
      if (s) return s;
    }
    return null;
  }, [partnerIds, storesMap]);

  // local coupon and tip for UX; persisted to checkout slice
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [tipPercent, setTipPercent] = useState<number>(9);

  const tip = useMemo(
    () => (subtotal * tipPercent) / 100,
    [subtotal, tipPercent]
  );
  const discount = useMemo(
    () => (subtotal > 0 ? (subtotal * discountPct) / 100 : 0),
    [subtotal, discountPct]
  );
  const total = Math.max(0, subtotal - discount) + shipping + serviceFee + tip;

  const [selectedMethod, setSelectedMethod] = useState<{
    brand: string;
    last4: string;
    cardholder_name: string | null;
  } | null>(null);

  // Prefill local state with the stored payment method so it shows without opening the modal
  useEffect(() => {
    if (storedPayment) {
      setSelectedMethod(storedPayment);
    }
  }, [storedPayment]);

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

  // persist to global slice on change
  useEffect(() => {
    dispatch(setCouponGlobal({ code: coupon, pct: discountPct }));
  }, [coupon, discountPct, dispatch]);
  useEffect(() => {
    dispatch(setTipGlobal(tipPercent));
  }, [tipPercent, dispatch]);

  const effectiveMethod = selectedMethod || storedPayment;
  const canProceed = items.length > 0 && !!effectiveMethod;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Stepper current="pago" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {/* Store Card and address headline */}
          <section className="rounded-2xl border bg-white p-4">
            <div className="text-xs text-gray-500">
              {status === "loading" ? "Cargando dirección…" : ""}
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

            {/* Payment method selector */}
            <div className="mt-4 rounded-xl border p-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">
                  {effectiveMethod
                    ? `Tarjeta ${effectiveMethod.brand} ·•••${effectiveMethod.last4}`
                    : "Selecciona un método de pago"}
                </div>
                <div className="text-xs text-gray-500">
                  {effectiveMethod?.cardholder_name || ""}
                </div>
              </div>
              <PaymentMethodsDialog
                trigger={
                  <button className="h-8 rounded-lg border px-3 text-xs">
                    Cambiar
                  </button>
                }
                onSelected={(m) => {
                  const val = m
                    ? {
                        brand: m.brand,
                        last4: m.last4,
                        cardholder_name: m.cardholder_name,
                      }
                    : null;
                  setSelectedMethod(val);
                  dispatch(setPaymentGlobal(val));
                }}
              />
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
            total={
              Math.max(0, subtotal - discount) + shipping + serviceFee + tip
            }
            disabled={!canProceed}
            cta={
              <Link
                href="/user/checkout/address"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-white text-sm font-medium"
              >
                Siguiente
              </Link>
            }
          />
        </aside>
      </div>
    </div>
  );
}
