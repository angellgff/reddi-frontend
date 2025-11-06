"use client";

import Link from "next/link";
import { useState, useMemo } from "react"; // Se añade useMemo
import { useRouter } from "next/navigation";
import Stepper from "@/src/components/features/finalUser/checkout/Stepper";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { selectCartItems, selectCartSubtotal } from "@/src/lib/store/cartSlice";
import {
  selectServiceFee,
  selectShippingFee,
} from "@/src/lib/store/chargesSlice";
import { clearCart } from "@/src/lib/store/cartSlice";
import { resetCheckout } from "@/src/lib/store/checkoutSlice";

function currency(n: number) {
  if (!isFinite(n)) return "$0.00";
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export default function CheckoutConfirmPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingFee);
  const serviceFee = useAppSelector(selectServiceFee);
  const checkout = useAppSelector((s) => s.checkout);
  const { addresses, selectedAddressId } = useAppSelector((s) => s.addresses);

  // Dirección seleccionada efectiva (checkout.addressId tiene prioridad)
  const effectiveAddressId = checkout.addressId || selectedAddressId || null;
  const selectedAddress = useMemo(
    () =>
      effectiveAddressId
        ? addresses.find((a) => String(a.id) === String(effectiveAddressId)) ||
          null
        : null,
    [addresses, effectiveAddressId]
  );
  const addressType = selectedAddress?.location_type
    ? String(selectedAddress.location_type)
    : null;
  const addressNumber = selectedAddress?.location_number
    ? String(selectedAddress.location_number)
    : null;

  // --- INICIO DE CAMBIO: Lógica de cálculo actualizada ---
  // Se calcula el descuento a partir del objeto 'coupon' en lugar de 'discountPct'
  const discount = useMemo(() => {
    if (!checkout.coupon || subtotal <= 0) {
      return 0;
    }
    if (checkout.coupon.discount_type === "percentage") {
      return (subtotal * checkout.coupon.discount_value) / 100;
    }
    if (checkout.coupon.discount_type === "fixed_amount") {
      return Math.min(subtotal, checkout.coupon.discount_value);
    }
    return 0;
  }, [subtotal, checkout.coupon]);
  // --- FIN DE CAMBIO ---

  // Propina efectiva como número
  const tip =
    checkout.tipAmountManual && checkout.tipAmountManual > 0
      ? checkout.tipAmountManual
      : (subtotal * checkout.tipPercent) / 100;
  // Si existe monto manual convertirlo a porcentaje para enviar al backend sin cambiar UX
  const effectiveTipPercent =
    subtotal > 0 && checkout.tipAmountManual && checkout.tipAmountManual > 0
      ? (checkout.tipAmountManual / subtotal) * 100
      : checkout.tipPercent;
  const total = Math.max(0, subtotal - discount) + shipping + serviceFee + tip;

  async function handleCreateOrder() {
    if (placing) return;
    setPlacing(true);
    setErrorMsg(null);
    try {
      // Prepara los mismos datos que antes
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

      const checkout_data = {
        addressId: checkout.addressId,
        placeType: checkout.placeType,
        placeNumber: checkout.placeNumber,
        instructions: checkout.instructions,
        schedule: checkout.schedule,
        couponId: checkout.coupon?.id ?? null,
        tipPercent: effectiveTipPercent,
        payment: checkout.payment,
        shippingCost: shipping,
        shippingMeta: checkout.shippingEstimate
          ? {
              cost: checkout.shippingEstimate.cost,
              distanceMeters: checkout.shippingEstimate.distanceMeters,
              durationSeconds: checkout.shippingEstimate.durationSeconds,
              origin: checkout.shippingEstimate.originCoordinates,
              destination: checkout.shippingEstimate.destinationCoordinates,
              routeGeoJson: checkout.shippingEstimate.routeGeoJson ?? null,
            }
          : null,
      };

      // --- INICIO DEL CAMBIO: LLAMADA A LA API ROUTE ---
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_items,
          checkout_data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Si la respuesta no es 2xx, lanza un error con el mensaje del servidor
        throw new Error(result.error || "No se pudo crear el pedido.");
      }
      // --- FIN DEL CAMBIO ---

      // Limpia estados locales
      dispatch(clearCart());
      dispatch(resetCheckout());

      // Redirige al estado del pedido usando el ID devuelto por la API Route
      const orderId = result.orderId;
      if (typeof orderId === "string" && orderId) {
        router.push(`/user/orders/${orderId}`);
      } else {
        // Fallback por si la respuesta es exitosa pero no viene el ID
        console.warn(
          "Respuesta exitosa pero no se recibió orderId, redirigiendo a la lista de órdenes."
        );
        router.push("/user/orders");
      }
    } catch (err) {
      console.error("handleCreateOrder error:", err);
      // El mensaje de error ahora vendrá de nuestra API Route, será más claro.
      let extracted = "No se pudo completar el pedido. Inténtalo de nuevo.";
      if (err instanceof Error) {
        extracted = err.message;
      }
      setErrorMsg(extracted);
    } finally {
      setPlacing(false);
    }
  }

  // --- NINGÚN CAMBIO VISUAL A PARTIR DE AQUÍ ---
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Stepper current="confirmar" />

      <section className="mt-8 rounded-2xl border border-[#D9DCE3] bg-white p-[30px]">
        <h2 className="text-center text-[28px] leading-8 font-semibold text-[#0D0D0D]">
          Resumen final
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-6">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Ítems</span>
              <span className="text-right">{items.length} productos</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total</span>
              <span className="text-right font-semibold">
                {currency(total)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Tipo de lugar</span>
              <span className="text-right capitalize">
                {addressType || checkout.placeType || "—"}
              </span>
            </div>
            {addressNumber ? (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Número</span>
                <span className="text-right">{addressNumber}</span>
              </div>
            ) : null}
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
                  : `${
                      (
                        checkout.schedule as {
                          mode: "later";
                          date: string;
                          time: string;
                        }
                      ).date
                    }, ${
                      (
                        checkout.schedule as {
                          mode: "later";
                          date: string;
                          time: string;
                        }
                      ).time
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
      {errorMsg ? (
        <div className="mt-4 text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg">
          {errorMsg}
        </div>
      ) : null}
      <div className="mt-6 flex items-center justify-between">
        <Link
          href="/user/checkout/address"
          className="h-10 rounded-xl border px-4 text-sm font-medium flex justify-center items-center hover:bg-gray-50"
        >
          Volver
        </Link>
        <button
          onClick={handleCreateOrder}
          disabled={placing || items.length === 0}
          className="h-10 rounded-xl bg-emerald-600 px-4 text-sm text-white font-medium flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {placing ? "Creando pedido…" : "Confirmar y seguir pedido"}
        </button>
      </div>
    </div>
  );
}
