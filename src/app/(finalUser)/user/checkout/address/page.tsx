"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import Stepper from "@/src/components/features/finalUser/checkout/Stepper";
import ScheduleStep from "@/src/components/features/finalUser/checkout/ScheduleStep";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { fetchUserAddresses, UserAddress } from "@/src/lib/store/addressSlice";
import {
  setAddressId,
  setSchedule,
  setShippingEstimate,
} from "@/src/lib/store/checkoutSlice";
import { openAddressSlider } from "@/src/lib/store/uiSlice";

import Select from "@/src/components/ui/Select";
import RouteMap from "@/src/components/features/finalUser/checkout/RouteMap";
import { setShippingFee } from "@/src/lib/store/chargesSlice";
import { CartItem } from "@/src/lib/store/cartSlice";

export default function CheckoutAddressPage() {
  const dispatch = useAppDispatch();
  const { status, addresses, selectedAddressId } = useAppSelector(
    (s) => s.addresses
  );
  const checkout = useAppSelector((s) => s.checkout);
  const cartItems = useAppSelector((s) => s.cart.items);

  useEffect(() => {
    if (status === "idle") dispatch(fetchUserAddresses());
  }, [status, dispatch]);

  const [addressId, setAddressLocal] = useState<string | null>(
    checkout.addressId
  );
  // Nota: este campo de instrucciones en la tarjeta de Figma es para la nueva dirección,
  // mantenemos las instrucciones del checkout aparte si fuese necesario.
  const [schedule, setScheduleLocal] = useState(checkout.schedule);
  
  // Sync local state with Redux state (hydration support)
  useEffect(() => {
    if (checkout.addressId && checkout.addressId !== addressId) {
      setAddressLocal(checkout.addressId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout.addressId]);

  useEffect(() => {
    // Deep comparison or simple check for schedule
    if (JSON.stringify(checkout.schedule) !== JSON.stringify(schedule)) {
      setScheduleLocal(checkout.schedule);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout.schedule]);

  useEffect(() => {
    dispatch(setAddressId(addressId ?? null));
  }, [addressId, dispatch]);
  useEffect(() => {
    dispatch(setSchedule(schedule));
  }, [schedule, dispatch]);

  // Derivar partnerId desde el carrito (asumimos un solo partner por pedido)
  const partnerId: string | null = (() => {
    if (!cartItems || cartItems.length === 0) return null;
    const unique = Array.from(
      new Set(cartItems.map((it: CartItem) => it.partnerId))
    );
    if (unique.length === 1 && typeof unique[0] === "string") return unique[0];
    return null; // múltiples partners o indefinido
  })();

  // Calcular costo de envío cuando hay address y partner definidos
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!addressId || !partnerId) {
        dispatch(setShippingEstimate(null));
        // También reflejar en cargos del carrito
        dispatch(setShippingFee(0));
        return;
      }
      try {
        setShippingLoading(true);
        setShippingError(null);
        const resp = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerId, userAddressId: addressId }),
        });
        const json = await resp.json();
        if (!resp.ok || json?.error) {
          throw new Error(json?.error || "No se pudo calcular el envío");
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
            })
          );
          // Propagar costo al carrito/summary
          dispatch(setShippingFee(Number(json.shippingCost ?? 0)));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setShippingError(e instanceof Error ? e.message : "Error inesperado");
          dispatch(setShippingEstimate(null));
          dispatch(setShippingFee(0));
        }
      } finally {
        if (!cancelled) setShippingLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [addressId, partnerId, dispatch]);

  // Si no hay addressId local, elegir la seleccionada del perfil o la primera disponible
  useEffect(() => {
    if (!addressId) {
      const fallback =
        (selectedAddressId as string | null) ||
        ((addresses?.[0]?.id as unknown as string) ?? null);
      if (fallback) setAddressLocal(fallback);
    }
  }, [addressId, selectedAddressId, addresses]);

  const canProceed =
    addressId &&
    (schedule.mode === "now" ||
      (schedule.mode === "later" && schedule.date && schedule.time));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Stepper current="direccion" />

      {/* Two-column layout: Left = Dirección; Right = Programación */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Dirección de entrega (estilo exacto Figma) */}
        <div className="lg:col-span-7">
          {/* Selector de direcciones guardadas (Headless UI) */}
          <div className="rounded-[16px] border border-[#D9DCE3] p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-[21px]">
              <h3 className="font-poppins text-[18px] leading-[22px] font-bold text-black">
                Dirección de entrega
              </h3>

              <div className="flex flex-col gap-2">
                <label className="font-roboto text-[14px] leading-[18px] font-medium text-[#292929]">
                  Seleccionar dirección
                </label>
                <Select
                  value={addressId}
                  onChange={(v) => setAddressLocal(v)}
                  placeholder="Selecciona una dirección"
                  options={(addresses || []).map((a) => ({
                    value: a.id as unknown as string,
                    label: `${String(a.location_type).toUpperCase()} ${
                      a.location_number
                    }`.trim(),
                  }))}
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3">
                  ¿No encuentras tu dirección? Puedes agregar o gestionar tus
                  direcciones en tu perfil.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch(openAddressSlider())}
                  className="inline-flex h-9 items-center justify-center rounded-[12px] bg-white px-5 font-poppins text-[14px] leading-4 text-[#04BD88] underline border border-[#04BD88]/20 hover:bg-emerald-50 transition-colors"
                >
                  Gestionar direcciones
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Programación de entrega */}
        <div className="lg:col-span-5">
          <ScheduleStep value={schedule} onChange={setScheduleLocal} />
          {/* Resumen de envío */}
          <div className="mt-4 rounded-xl border border-[#D9DCE3] p-4 text-sm">
            <div className="font-medium mb-2">Costo de envío</div>
            {shippingLoading ? (
              <div>Calculando...</div>
            ) : shippingError ? (
              <div className="text-red-600">{shippingError}</div>
            ) : checkout.shippingEstimate ? (
              <div className="space-y-1">
                <div>
                  Estimado:{" "}
                  <span className="font-semibold">
                    ${checkout.shippingEstimate.cost.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Distancia:{" "}
                  {(checkout.shippingEstimate.distanceMeters / 1000).toFixed(2)}{" "}
                  km · Tiempo:{" "}
                  {Math.ceil(checkout.shippingEstimate.durationSeconds / 60)}{" "}
                  min
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                Selecciona una dirección para calcular el envío
              </div>
            )}
          </div>

          {/* Mapa de ruta */}
          {checkout.shippingEstimate ? (
            <div className="mt-4">
              <RouteMap
                origin={checkout.shippingEstimate.originCoordinates}
                destination={checkout.shippingEstimate.destinationCoordinates}
                routeGeoJson={checkout.shippingEstimate.routeGeoJson}
                height={280}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer actions: Bottom buttons */}
      <div className="mt-6 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <Link
            href="/user/checkout/payment"
            className="h-10 rounded-xl border px-4 text-sm flex justify-center items-center"
          >
            Volver
          </Link>
          <Link
            href="/user/checkout/confirm"
            className={`h-10 rounded-xl px-4 text-sm text-white flex justify-center items-center ${
              canProceed ? "bg-emerald-600" : "bg-gray-300 pointer-events-none"
            }`}
          >
            Siguiente
          </Link>
        </div>
      </div>
    </div>
  );
}
