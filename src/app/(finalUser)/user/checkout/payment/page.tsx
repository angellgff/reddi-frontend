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
import { createClient } from "@/src/lib/supabase/client";
import {
  setPayment as setPaymentGlobal,
  setCoupon as setCouponGlobal,
  setTipPercent as setTipGlobal,
  setTipAmountManual,
  ValidatedCoupon,
} from "@/src/lib/store/checkoutSlice";
import { withTimeout } from "@/src/lib/utils";

export default function CheckoutPaymentPage() {
  const dispatch = useAppDispatch();
  const supabase = createClient();

  // Selectors de Redux
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingFee);
  const serviceFee = useAppSelector(selectServiceFee);

  // Datos persistidos del slice de checkout
  const storedPayment = useAppSelector((s) => s.checkout.payment);
  const storedCoupon = useAppSelector((s) => s.checkout.coupon);
  const storedTipPercent = useAppSelector((s) => s.checkout.tipPercent);
  const storedTipAmountManual = useAppSelector(
    (s) => s.checkout.tipAmountManual
  );

  // Estado para la dirección y la tienda
  const { status } = useAppSelector((s) => s.addresses);
  useEffect(() => {
    if (status === "idle") dispatch(fetchUserAddresses());
  }, [status, dispatch]);

  const partnerIds = useMemo(() => items.map((i) => i.partnerId), [items]);
  const {
    data: storesMap,
    loading: storesLoading,
    error: storesError,
  } = useStoreDetailsClient(partnerIds);
  const firstStore = useMemo(() => {
    for (const id of partnerIds) {
      const s = storesMap?.[id];
      if (s) return s;
    }
    return null;
  }, [partnerIds, storesMap]);

  // Debug logs to trace potential freezes
  useEffect(() => {
    console.debug("CheckoutPayment: partnerIds", partnerIds);
  }, [partnerIds]);
  useEffect(() => {
    console.debug("CheckoutPayment: stores state", {
      loading: storesLoading,
      error: storesError,
      keys: storesMap ? Object.keys(storesMap) : [],
    });
  }, [storesLoading, storesError, storesMap]);

  // --- Estado Local para la UI ---
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [tipPercent, setTipPercent] = useState<number>(storedTipPercent || 9);
  // Nuevo: permitir propina manual (monto fijo); si es > 0, tiene prioridad sobre el porcentaje
  const [manualTipAmount, setManualTipAmount] = useState<number>(
    storedTipAmountManual || 0
  );
  const [showManualTip, setShowManualTip] = useState<boolean>(
    storedTipAmountManual ? true : false
  );
  const [selectedMethod, setSelectedMethod] = useState(storedPayment);

  // Pre-rellenar el input si ya hay un cupón aplicado en Redux
  useEffect(() => {
    if (storedCoupon) {
      setCouponInput(storedCoupon.code);
      setCouponMsg("Cupón aplicado.");
    }
  }, [storedCoupon]);

  // --- Lógica de Cálculo de Totales ---
  const discount = useMemo(() => {
    if (!storedCoupon || subtotal <= 0) {
      return 0;
    }
    if (storedCoupon.discount_type === "percentage") {
      return (subtotal * storedCoupon.discount_value) / 100;
    }
    if (storedCoupon.discount_type === "fixed_amount") {
      return Math.min(subtotal, storedCoupon.discount_value);
    }
    return 0;
  }, [subtotal, storedCoupon]);

  const tip = useMemo(() => {
    // Si el usuario ingresó un monto manual positivo, usarlo
    if (manualTipAmount > 0) return manualTipAmount;
    // De lo contrario, usar porcentaje
    return (subtotal * tipPercent) / 100;
  }, [subtotal, tipPercent, manualTipAmount]);

  const total = Math.max(0, subtotal - discount) + shipping + serviceFee + tip;

  // --- Manejadores de Eventos ---
  const validateCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponMsg("Ingresa un cupón válido");
      dispatch(setCouponGlobal(null));
      return;
    }

    setIsValidatingCoupon(true);
    setCouponMsg(null);

    try {
      const { data, error } = await withTimeout(
        supabase.functions.invoke("validate-coupon", {
          body: { couponCode: code, subtotal },
        }),
        4000,
        "coupon-timeout"
      );

      if (error) throw new Error(error.message);

      if (data.valid) {
        setCouponMsg(data.message);
        dispatch(setCouponGlobal(data.coupon as ValidatedCoupon));
      } else {
        setCouponMsg(data.message || "Cupón inválido");
        dispatch(setCouponGlobal(null));
      }
    } catch (e) {
      setCouponMsg("Ocurrió un error al validar el cupón.");
      dispatch(setCouponGlobal(null));
      console.error("Error validating coupon:", e);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Persistir porcentaje en Redux al cambiar
  useEffect(() => {
    dispatch(setTipGlobal(tipPercent));
  }, [tipPercent, dispatch]);

  // Persistir monto manual en Redux cuando cambia
  useEffect(() => {
    if (manualTipAmount > 0) {
      dispatch(setTipAmountManual(manualTipAmount));
    } else {
      dispatch(setTipAmountManual(null));
    }
  }, [manualTipAmount, dispatch]);

  const effectiveMethod = selectedMethod || storedPayment;
  const canProceed = items.length > 0 && !!effectiveMethod;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Stepper current="pago" />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <section className="rounded-2xl border bg-white p-4">
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
                  {firstStore?.name ||
                    (storesLoading
                      ? "Cargando tienda..."
                      : storesError
                      ? "Tienda no disponible"
                      : "Sin datos de tienda")}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {firstStore?.address ||
                    (storesLoading
                      ? "Cargando dirección..."
                      : storesError
                      ? "—"
                      : "—")}
                </div>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {items.length} producto(s)
              </div>
            </div>

            {storesError ? (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                No se pudo cargar la información de la tienda. Detalle:{" "}
                {String(storesError)}
              </div>
            ) : null}

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
                  setSelectedMethod(m);
                  dispatch(setPaymentGlobal(m));
                }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Ingresar cupón"
                className="sm:col-span-2 h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100"
                disabled={isValidatingCoupon}
              />
              <button
                onClick={validateCoupon}
                disabled={isValidatingCoupon}
                className="h-10 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:bg-emerald-300"
              >
                {isValidatingCoupon ? "Validando..." : "Validar"}
              </button>
            </div>
            {couponMsg ? (
              <div
                className={`mt-1 text-xs ${
                  storedCoupon ? "text-green-600" : "text-red-600"
                }`}
              >
                {couponMsg}
              </div>
            ) : null}

            <div className="mt-5">
              <div className="text-sm font-medium">
                Gratificación para el conductor
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Considera dejar una gratificación adicional para reconocer su
                trabajo.
              </p>
              <div className="mt-3">
                <TipSelector value={tipPercent} onChange={setTipPercent} />
              </div>
              {/* Toggle propina manual */}
              <div className="mt-4">
                {!showManualTip && manualTipAmount === 0 ? (
                  <button
                    type="button"
                    onClick={() => setShowManualTip(true)}
                    className="h-9 rounded-lg border px-3 text-xs hover:bg-gray-50"
                  >
                    Propina manual
                  </button>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-600">
                        Propina manual (monto)
                      </label>
                      <div className="mt-1 flex items-center rounded-xl border px-3 h-10 bg-white focus-within:ring-2 focus-within:ring-primary/40">
                        <span className="text-gray-500 mr-2 text-sm">$</span>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          inputMode="decimal"
                          value={
                            Number.isNaN(manualTipAmount) ? "" : manualTipAmount
                          }
                          onChange={(e) => {
                            const raw = e.target.value;
                            const n = Number(raw.replace(/,/g, "."));
                            if (!raw) {
                              setManualTipAmount(0);
                              return;
                            }
                            if (Number.isFinite(n) && n >= 0)
                              setManualTipAmount(n);
                          }}
                          placeholder="Ingresa un monto (opcional)"
                          className="flex-1 outline-none text-sm"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Si ingresas un monto manual, se ignorará el porcentaje
                        seleccionado.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setManualTipAmount(0);
                          setShowManualTip(false);
                        }}
                        className="h-10 rounded-xl border px-3 text-xs hover:bg-gray-50"
                      >
                        Usar porcentaje
                      </button>
                      {manualTipAmount > 0 ? (
                        <span className="text-[10px] text-emerald-600 text-center">
                          Aplicando monto manual
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <SummaryCard
            rows={[
              { label: "Costo de productos", value: subtotal },
              ...(storedCoupon
                ? [
                    {
                      label: `Cupón ${storedCoupon.code}`,
                      value: discount,
                      negative: true,
                    },
                  ]
                : []),
              { label: "Costo de envío", value: shipping },
              { label: "Tarifa de servicio", value: serviceFee },
              {
                label:
                  manualTipAmount > 0
                    ? "Propina (monto manual)"
                    : `Propina (${tipPercent}%)`,
                value: tip,
              },
            ]}
            total={total}
            disabled={!canProceed}
            cta={
              <Link
                href="/user/checkout/address"
                className={`mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-white text-sm font-medium ${
                  canProceed
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                aria-disabled={!canProceed}
                onClick={(e) => !canProceed && e.preventDefault()}
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
