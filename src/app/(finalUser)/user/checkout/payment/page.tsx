"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { selectCartItems, selectCartSubtotal } from "@/src/lib/store/cartSlice";
import {
  selectServiceFee,
  selectShippingFee,
  selectShippingEstimate,
  setShippingEstimate,
  setShippingFee,
} from "@/src/lib/store/chargesSlice";
import {
  updateSelectedAddress,
  fetchUserAddresses,
} from "@/src/lib/store/addressSlice";
import Stepper from "@/src/components/features/finalUser/checkout/Stepper";
// import PaymentMethodsDialog from "@/src/components/features/finalUser/checkout/PaymentMethodsDialog";
import SummaryCard from "@/src/components/features/finalUser/checkout/SummaryCard";
import TipSelector from "@/src/components/features/finalUser/checkout/TipSelector";
import { useStoreDetailsClient } from "@/src/lib/finalUser/stores/useStoreDetailsClient";
import {
  setPayment as setPaymentGlobal,
  setCoupon as setCouponGlobal,
  setTipPercent as setTipGlobal,
  setTipAmountManual,
  setInstructions,
  resetCheckout,
} from "@/src/lib/store/checkoutSlice";
import { withTimeout } from "@/src/lib/utils";
import { validateCouponAction } from "@/src/lib/actions/coupon";
import { useRouter } from "next/navigation";
import MobileCheckoutView from "@/src/components/features/finalUser/checkout/MobileCheckoutView";
import { clearCart } from "@/src/lib/store/cartSlice";

export default function CheckoutPaymentPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dispatch = useAppDispatch();

  // Selectors de Redux
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingFee);
  const serviceFee = useAppSelector(selectServiceFee);
  const shippingEstimate = useAppSelector(selectShippingEstimate);

  // Address State
  const addresses = useAppSelector((s) => s.addresses.addresses);
  const selectedAddressId = useAppSelector(
    (s) => s.addresses.selectedAddressId,
  );
  const addressStatus = useAppSelector((s) => s.addresses.status);

  // Ensure addresses are loaded
  useEffect(() => {
    if (addressStatus === "idle") {
      dispatch(fetchUserAddresses());
    }
  }, [addressStatus, dispatch]);

  // Datos persistidos del slice de checkout
  const storedPayment = useAppSelector((s) => s.checkout.payment);
  const storedCoupon = useAppSelector((s) => s.checkout.coupon);
  const storedTipPercent = useAppSelector((s) => s.checkout.tipPercent);
  const storedTipAmountManual = useAppSelector(
    (s) => s.checkout.tipAmountManual,
  );

  // Estado para la dirección y la tienda
  // const { status } = useAppSelector((s) => s.addresses);

  const partnerIdStr = items
    .map((i) => i.partnerId)
    .sort()
    .join(",");
  const partnerIds = useMemo(
    () => items.map((i) => i.partnerId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partnerIdStr],
  );
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

  // Handle Address Selection
  const handleSelectAddress = (id: string) => {
    dispatch(updateSelectedAddress(id));
  };

  // Shipping Calculation Logic
  const firstPartnerId = items[0]?.partnerId;
  useEffect(() => {
    let cancelled = false;
    // We need a store partnerId. Assuming single store for now from first item.
    // If multiple stores, this logic needs to be per-store, but current architecture seems to assume one store per checkout or handles it elsewhere.

    async function calculateShipping() {
      if (!selectedAddressId || !firstPartnerId) {
        return;
      }

      try {
        const resp = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerId: firstPartnerId,
            userAddressId: selectedAddressId,
          }),
        });
        const json = await resp.json();

        if (!resp.ok || json?.error) {
          console.error("Shipping calc error:", json?.error);
          return;
        }

        if (!cancelled) {
          dispatch(
            setShippingEstimate({
              cost: Number(json.shippingCost ?? 0),
              distanceMeters: Number(json.distanceMeters ?? 0),
              durationSeconds: Number(json.durationSeconds ?? 0),
              originCoordinates: json.originCoordinates,
              destinationCoordinates: json.destinationCoordinates,
              routeGeoJson: json.routeGeoJson ?? null,
            }),
          );
          dispatch(setShippingFee(Number(json.shippingCost ?? 0)));
        }
      } catch (e) {
        console.error("Error fetching shipping:", e);
      }
    }

    calculateShipping();

    return () => {
      cancelled = true;
    };
  }, [selectedAddressId, firstPartnerId, dispatch]);

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
    storedTipAmountManual || 0,
  );
  // Estado local para el input (string) para permitir borrar el 0
  const [inputValue, setInputValue] = useState<string>(
    storedTipAmountManual ? String(storedTipAmountManual) : "",
  );

  const [showManualTip, setShowManualTip] = useState<boolean>(
    storedTipAmountManual !== null, // Si hay almacenado (incluso 0 si fue intencional, aunque por ahora null si no manual), mostramos section
  );
  // Removed local selectedMethod state to prevent sync loops with Redux
  const [instruction, setInstruction] = useState<"door" | "hand">("door");

  const storedInstructions = useAppSelector((s) => s.checkout.instructions);

  // Sync local state with Redux state (hydration support)
  useEffect(() => {
    if (
      storedTipPercent !== undefined &&
      storedTipPercent !== null &&
      storedTipPercent !== tipPercent
    ) {
      setTipPercent(storedTipPercent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedTipPercent]);

  useEffect(() => {
    const newVal =
      instruction === "door" ? "Dejar en la puerta" : "Entrégamelo a mí";
    if (storedInstructions !== newVal) {
      dispatch(setInstructions(newVal));
    }
  }, [instruction, storedInstructions, dispatch]);

  useEffect(() => {
    // Treat null as 0 for manual tip comparison to avoid loop
    const normalizedStored =
      storedTipAmountManual === null ? 0 : storedTipAmountManual;

    if (normalizedStored !== manualTipAmount) {
      setManualTipAmount(normalizedStored);
      setInputValue(normalizedStored > 0 ? String(normalizedStored) : "");
      if (storedTipAmountManual !== null) setShowManualTip(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedTipAmountManual]);

  // Removed useEffect syncing storedPayment -> selectedMethod due to infinite loop potential.
  // We will rely on storedPayment directly.

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
    // Si la propina manual está activa, usamos su valor (incluso 0)
    if (showManualTip) return manualTipAmount;
    // De lo contrario, usar porcentaje
    return (subtotal * tipPercent) / 100;
  }, [subtotal, tipPercent, manualTipAmount, showManualTip]);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const total = Math.max(0, subtotal - discount) + shipping + serviceFee + tip;

  // --- Manejadores de Eventos ---
  async function handleCreateOrder() {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      // Validar que exista método de pago
      if (!storedPayment) {
        throw new Error("Por favor selecciona un método de pago.");
      }

      // 1. Preparar items para la DB
      const cart_items = items.map((it) => ({
        productId: it.productId,
        partnerId: it.partnerId,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        note: it.note ?? null,
        extras: it.extras.map((e) => ({
          extraId: e.extraId,
          quantity: e.quantity,
          price: e.price,
        })),
      }));

      // Calculate effective tip percent for the backend (same as confirm page)
      const effectiveTipPercent =
        subtotal > 0 && showManualTip && manualTipAmount > 0
          ? (manualTipAmount / subtotal) * 100
          : tipPercent;

      // 2. Preparar datos del checkout
      const checkout_data = {
        addressId: selectedAddressId,
        placeType: null, // Si aplica
        placeNumber: null, // Si aplica
        instructions:
          instruction === "door" ? "Dejar en la puerta" : "Entrégamelo a mí",
        schedule: { mode: "now" },
        couponId: storedCoupon?.id ?? null,
        tipPercent: effectiveTipPercent,
        shippingCost: shipping,

        // Enviamos el pago tal cual (ej. manual/cash)
        payment: storedPayment,

        shippingMeta: shippingEstimate
          ? {
              cost: shippingEstimate.cost,
              distanceMeters: shippingEstimate.distanceMeters,
              durationSeconds: shippingEstimate.durationSeconds,
              origin: shippingEstimate.originCoordinates,
              destination: shippingEstimate.destinationCoordinates,
              routeGeoJson: shippingEstimate.routeGeoJson ?? null,
            }
          : null,
      };

      console.log("checkout_data to send (mobile flow):", checkout_data);

      // 3. Crear orden en Base de Datos (Supabase)
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_items, checkout_data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo crear el pedido.");
      }

      const orderId = result.orderId;

      // 4. ÉXITO (Pago Manual)
      dispatch(clearCart());
      dispatch(resetCheckout());

      if (typeof orderId === "string" && orderId) {
        router.push(`/user/orders/${orderId}`);
      } else {
        router.push("/user/orders");
      }
    } catch (err) {
      console.error("handleCreateOrder error:", err);
      alert("No se pudo completar el pedido. Inténtalo de nuevo.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

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
      const result = await withTimeout(
        validateCouponAction(code, subtotal),
        4000,
        "coupon-timeout",
      );

      if (result.success && result.coupon) {
        setCouponMsg(result.message);
        dispatch(setCouponGlobal(result.coupon));
      } else {
        setCouponMsg(result.message || "Cupón inválido");
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
    if (storedTipPercent !== tipPercent) {
      dispatch(setTipGlobal(tipPercent));
    }
  }, [tipPercent, dispatch]);

  // Persistir monto manual en Redux cuando cambia
  useEffect(() => {
    if (manualTipAmount > 0) {
      if (storedTipAmountManual !== manualTipAmount) {
        dispatch(setTipAmountManual(manualTipAmount));
      }
    } else {
      if (storedTipAmountManual !== null) {
        dispatch(setTipAmountManual(null));
      }
    }
  }, [manualTipAmount, storedTipAmountManual, dispatch]);

  const effectiveMethod = storedPayment;
  // const canProceed = items.length > 0 && !!effectiveMethod;
  const canProceed = items.length > 0; // Permitir avanzar sin método de pago seleccionado
  const router = useRouter();
  const selectedAddress = useAppSelector((state) =>
    state.addresses.selectedAddressId
      ? state.addresses.addresses.find(
          (a) => a.id === state.addresses.selectedAddressId,
        )
      : null,
  );

  const deliveryTimeVal = useMemo(() => {
    if (!shippingEstimate?.durationSeconds) return "15-25 min";
    const mins = Math.ceil(shippingEstimate.durationSeconds / 60);
    return `${mins}-${mins + 15} min`;
  }, [shippingEstimate]);

  if (!isMounted) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <>
      <div className="lg:hidden">
        <MobileCheckoutView
          storeName={firstStore?.name || "Tienda"}
          storeImage={firstStore?.image_url}
          // Addresses
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={handleSelectAddress}
          deliveryTime={deliveryTimeVal}
          instruction={instruction}
          setInstruction={setInstruction}
          tipPercent={tipPercent}
          manualTipAmount={manualTipAmount}
          setTipPercent={setTipPercent}
          setManualTipAmount={(val) => {
            setManualTipAmount(val);
            setInputValue(val > 0 ? String(val) : "");
            if (val === 0) {
              setShowManualTip(false);
            } else {
              setShowManualTip(true);
            }
          }}
          selectedPaymentMethod={(effectiveMethod?.method as any) || null}
          onSelectPaymentMethod={(method) => {
            const paymentObj = {
              method,
              brand: method === "cash" ? "Efectivo" : "Datáfono",
              last4: null,
              cardholder_name: null,
              provider: "manual",
            };
            // Cast to any to avoid strict type checking issues if Redux type is slightly different
            dispatch(setPaymentGlobal(paymentObj as any));
          }}
          couponCode={storedCoupon?.code}
          couponDiscount={discount}
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          validateCoupon={validateCoupon}
          isValidatingCoupon={isValidatingCoupon}
          couponMsg={couponMsg}
          subtotal={subtotal}
          promotion={discount}
          deliveryFee={shipping}
          serviceFee={serviceFee}
          total={total}
          onPlaceOrder={handleCreateOrder}
          canProceed={canProceed}
          onBack={() => router.back()}
        />
      </div>
      <div className="hidden lg:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
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

              {/* SECCIÓN DE MÉTODO DE PAGO - MANUAL */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Método de pago
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Opción Efectivo */}
                  <div
                    onClick={() => {
                      const payment = {
                        method: "cash",
                        provider: "manual",
                        brand: "Efectivo",
                      };
                      // setSelectedMethod removed, rely on Redux
                      dispatch(setPaymentGlobal(payment));
                    }}
                    className={`cursor-pointer rounded-xl border p-4 flex items-center gap-3 transition-all ${
                      storedPayment?.method === "cash"
                        ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        storedPayment?.method === "cash"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {/* Icono Efectivo (Billete) */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Efectivo
                      </p>
                      <p className="text-xs text-gray-500">Paga al recibir</p>
                    </div>
                  </div>

                  {/* Opción Datáfono (Tarjeta contra entrega) */}
                  <div
                    onClick={() => {
                      const payment = {
                        method: "physical_pos",
                        provider: "manual",
                        brand: "Datáfono",
                      };
                      // setSelectedMethod removed
                      dispatch(setPaymentGlobal(payment));
                    }}
                    className={`cursor-pointer rounded-xl border p-4 flex items-center gap-3 transition-all ${
                      storedPayment?.method === "physical_pos"
                        ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        storedPayment?.method === "physical_pos"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {/* Icono Tarjeta */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Tarjeta (Datáfono)
                      </p>
                      <p className="text-xs text-gray-500">Paga al recibir</p>
                    </div>
                  </div>
                </div>
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
                  {!showManualTip ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualTip(true);
                        setManualTipAmount(0); // Iniciar en 0
                        setInputValue(""); // Input visualmente vacío (placeholder)
                      }}
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
                          <span className="text-gray-500 mr-2 text-sm">
                            RD$
                          </span>
                          <input
                            type="text" // Cambiar a text para mejor control y permitir vacio
                            inputMode="decimal"
                            value={inputValue}
                            onChange={(e) => {
                              let raw = e.target.value;

                              // Permitir solo números y un punto
                              if (!/^\d*\.?\d*$/.test(raw)) return;

                              // Evitar ceros a la izquierda (excepto "0." o el "0" solo si es lo único)
                              if (
                                raw.length > 1 &&
                                raw.startsWith("0") &&
                                raw[1] !== "."
                              ) {
                                raw = raw.substring(1);
                              }

                              setInputValue(raw);

                              if (!raw) {
                                setManualTipAmount(0);
                                return;
                              }

                              const n = parseFloat(raw);
                              if (!isNaN(n)) {
                                setManualTipAmount(n);
                              }
                            }}
                            placeholder="0"
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
                            setInputValue("");
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
                  label: showManualTip
                    ? "Propina (monto manual)"
                    : `Propina (${tipPercent}%)`,
                  value: tip,
                },
              ]}
              total={total}
              disabled={!canProceed}
              cta={
                <>
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
                  <div className="flex flex-row items-center justify-center gap-4 mt-4">
                    <Image
                      src="/logos-visa-mastercard.png"
                      alt="Visa and Mastercard"
                      width={80}
                      height={30}
                      className="h-8 w-auto object-contain"
                    />
                    <Image
                      src="/mastercard-id-check.png"
                      alt="Mastercard ID Check"
                      width={80}
                      height={30}
                      className="h-8 w-auto object-contain"
                    />
                    <Image
                      src="/verified-by-visa.png"
                      alt="Verified by Visa"
                      width={80}
                      height={30}
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                </>
              }
            />
          </aside>
        </div>
      </div>
    </>
  );
}
