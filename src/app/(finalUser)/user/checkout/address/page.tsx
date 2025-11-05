"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import Stepper from "@/src/components/features/finalUser/checkout/Stepper";
import ScheduleStep from "@/src/components/features/finalUser/checkout/ScheduleStep";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { fetchUserAddresses } from "@/src/lib/store/addressSlice";
import {
  setAddressId,
  setSchedule,
  setShippingEstimate,
} from "@/src/lib/store/checkoutSlice";
import { createUserAddress } from "@/src/lib/finalUser/addresses/actions";
import type { Enums } from "@/src/lib/database.types";
import Select from "@/src/components/ui/Select";
import RouteMap from "@/src/components/features/finalUser/checkout/RouteMap";

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
  const [newAddressInstructions, setNewAddressInstructions] =
    useState<string>("");
  const [schedule, setScheduleLocal] = useState(checkout.schedule);
  const [isSaving, startTransition] = useTransition();
  const [newLocationType, setNewLocationType] =
    useState<Enums<"address_location_type"> | null>(null);
  const [newLocationNumber, setNewLocationNumber] = useState("");
  const [newAddressError, setNewAddressError] = useState<string | null>(null);

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
      new Set(cartItems.map((it: any) => it.partnerId))
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
        }
      } catch (e: any) {
        if (!cancelled) {
          setShippingError(
            typeof e?.message === "string" ? e.message : "Error inesperado"
          );
          dispatch(setShippingEstimate(null));
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
      ((schedule as any).date && (schedule as any).time));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Stepper current="direccion" />

      {/* Two-column layout: Left = Dirección; Right = Programación */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Dirección de entrega (estilo exacto Figma) */}
        <div className="lg:col-span-7">
          {/* Selector de direcciones guardadas (Headless UI) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setNewAddressError(null);
              const fd = new FormData();
              if (newLocationType) fd.set("location_type", newLocationType);
              fd.set("location_number", newLocationNumber);
              if (newAddressInstructions)
                fd.set("instructions", newAddressInstructions);
              startTransition(async () => {
                const res = await createUserAddress(fd);
                if (!res.success) {
                  setNewAddressError(res.error || "No se pudo guardar");
                  return;
                }
                const resultAction = await dispatch(fetchUserAddresses());
                // Intentar auto-seleccionar la recién creada buscando por tipo+número
                if ((resultAction as any)?.type?.endsWith("/fulfilled")) {
                  const payload: any = (resultAction as any).payload;
                  const list = payload?.addresses || addresses || [];
                  const created = list.find(
                    (a: any) =>
                      String(a.location_type) === String(newLocationType) &&
                      String(a.location_number).trim() ===
                        String(newLocationNumber).trim()
                  );
                  if (created?.id) {
                    const newId = created.id as unknown as string;
                    setAddressLocal(newId);
                  }
                }
                // Reset a estado inicial visual (placeholder en select)
                setNewLocationType(null);
                setNewLocationNumber("");
                setNewAddressInstructions("");
              });
            }}
            className="rounded-[16px] border border-[#D9DCE3] p-6 "
          >
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

              {/* (El selector de direcciones se movió a un card aparte arriba) */}

              {/* Tipo de lugar */}
              <div className="flex flex-col gap-2">
                <label className="font-roboto text-[14px] leading-[18px] font-medium text-[#292929]">
                  Tipo de lugar
                </label>
                <Select
                  value={newLocationType}
                  onChange={(v) =>
                    setNewLocationType(
                      (v as Enums<"address_location_type">) ?? null
                    )
                  }
                  placeholder="Seleccione"
                  options={[
                    { value: "villa", label: "Villa" },
                    { value: "yate", label: "Yate" },
                  ]}
                />
              </div>

              {/* Número de villa o yate */}
              <div className="flex flex-col gap-2">
                <label className="font-roboto text-[14px] leading-[18px] font-medium text-[#292929]">
                  Numero de la villa o yate
                </label>
                <input
                  value={newLocationNumber}
                  onChange={(e) => setNewLocationNumber(e.target.value)}
                  placeholder="Ingresa la información"
                  className="h-10 px-4 border border-[#D9DCE3] rounded-[12px] text-[16px] leading-5 text-[#292929] placeholder:text-[#292929]/50 outline-none"
                />
              </div>

              {/* Instrucciones especiales */}
              <div className="flex flex-col gap-2">
                <label className="font-roboto text-[14px] leading-[18px] font-medium text-[#292929]">
                  Instrucciones especiales para la entrega
                </label>
                <textarea
                  value={newAddressInstructions}
                  onChange={(e) => setNewAddressInstructions(e.target.value)}
                  placeholder="Ingresa la información"
                  className="min-h-[91px] px-4 py-[10px] border border-[#D9DCE3] rounded-[12px] text-[16px] leading-5 text-[#292929] placeholder:text-[#292929]/50 outline-none resize-none"
                />
              </div>

              {newAddressError ? (
                <p className="text-sm text-red-600">{newAddressError}</p>
              ) : null}

              {/* Guardar dirección (link button) */}
              <div>
                <button
                  type="submit"
                  disabled={isSaving || !newLocationType || !newLocationNumber}
                  className="inline-flex h-9 items-center justify-center rounded-[12px] bg-white px-5 font-poppins text-[14px] leading-4 text-[#04BD88] underline disabled:opacity-60"
                >
                  Guardar dirección
                </button>
              </div>
            </div>
          </form>
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
