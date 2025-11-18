"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import RouteMap from "@/src/components/features/finalUser/checkout/RouteMap";
import { createClient } from "@/src/lib/supabase/client";

// --- TIPOS ---
type DeliveryInfo = {
  assigned: boolean;
  name?: string;
  phone_number?: string | null;
};

type MinimalProfile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
};

// --- FUNCIÓN DE UTILIDAD ---
function displayName(user: MinimalProfile | null | undefined): string {
  if (!user) return "Repartidor";

  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  if (fullName) return fullName;

  const emailPrefix =
    typeof user.email === "string" ? user.email.split("@")[0] : "";
  return emailPrefix || "Repartidor";
}

// --- COMPONENTE PRINCIPAL ---
export default function MarketOrderMapAndDriver(props: {
  orderId: string;
  partnerId?: string | null;
  userAddressId?: string | null;
}) {
  const { orderId, partnerId, userAddressId } = props;

  const [route, setRoute] = useState<{
    origin?: { longitude: number; latitude: number } | null;
    destination?: { longitude: number; latitude: number } | null;
    routeGeoJson?: {
      type: "LineString";
      coordinates: [number, number][];
    } | null;
  }>({});
  const [delivery, setDelivery] = useState<DeliveryInfo>({ assigned: false });

  useEffect(() => {
    let mounted = true;

    async function loadRoute() {
      if (!partnerId || !userAddressId) return;
      try {
        const resp = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerId, userAddressId }),
        });
        if (resp.ok) {
          const details = await resp.json();
          if (mounted) {
            setRoute({
              origin: details.originCoordinates || null,
              destination: details.destinationCoordinates || null,
              routeGeoJson: details.routeGeoJson || null,
            });
          }
        }
      } catch (error) {
        console.error("Error al cargar la ruta:", error);
      }
    }

    async function loadDelivery() {
      if (!orderId) return;

      try {
        const supabase = createClient();

        // 1. Obtener el shipment_id de la orden
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("shipment_id")
          .eq("id", orderId)
          .single();

        if (orderError || !orderData?.shipment_id) {
          throw new Error(
            `No se encontró un envío para la orden ${orderId}. Error: ${
              orderError?.message || "shipment_id es nulo"
            }`
          );
        }

        // 2. Con el shipment_id, buscar el driver y su perfil anidado
        const { data: shipmentData, error: shipmentError } = await supabase
          .from("shipments")
          .select(
            `
                id,
                driver:drivers (
                    user:profiles (
                        id,
                        first_name,
                        last_name,
                        email,
                        phone_number
                    )
                )
            `
          )
          .eq("id", orderData.shipment_id)
          .single();

        if (shipmentError) throw shipmentError;

        // Extraer el perfil del repartidor de la estructura anidada
        const driverProfile = (shipmentData as any)?.driver
          ?.user as MinimalProfile | null;

        if (mounted) {
          if (driverProfile) {
            setDelivery({
              assigned: true,
              name: displayName(driverProfile),
              phone_number: driverProfile.phone_number,
            });
          } else {
            setDelivery({ assigned: false });
          }
        }
      } catch (error) {
        console.error("Error al cargar la información del repartidor:", error);
        if (mounted) setDelivery({ assigned: false });
      }
    }

    loadRoute();
    loadDelivery();

    return () => {
      mounted = false;
    };
  }, [orderId, partnerId, userAddressId]);

  return (
    <div className="rounded-2xl border border-[#D9DCE3] bg-white p-4 shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_4px_rgba(12,12,13,0.05)]">
      {route?.origin && route?.destination ? (
        <RouteMap
          origin={route.origin}
          destination={route.destination}
          routeGeoJson={route.routeGeoJson ?? undefined}
          height={300}
        />
      ) : (
        <div className="h-[300px] w-full rounded-xl bg-[url('/placeholder-map.png')] bg-cover bg-center" />
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-[#9BA1AE] bg-[rgba(240,242,245,0.72)] p-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-300">
            {/* Opcional: Añadir un SVG genérico de un usuario o repartidor aquí */}
          </div>
          <div>
            <div className="text-[16px] font-medium leading-5 text-[#171717]">
              {delivery?.assigned ? delivery?.name : "Sin repartidor asignado"}
            </div>
            <div className="text-[14px] leading-[18px] text-[#292929]">
              {delivery?.assigned
                ? "Repartidor asignado"
                : "Esperando asignación"}
            </div>
          </div>
        </div>
        {delivery?.assigned && delivery?.phone_number ? (
          <a
            href={`tel:${delivery.phone_number}`}
            className="inline-flex h-[51px] w-[51px] items-center justify-center rounded-full border border-[#04BD88] bg-[#CDF7E7]"
            title="Llamar al repartidor"
          >
            <span className="sr-only">Llamar al repartidor</span>
            {/* Opcional: Añadir un ícono de teléfono aquí */}
          </a>
        ) : (
          <button
            className="inline-flex h-[51px] w-[51px] cursor-not-allowed items-center justify-center rounded-full border border-[#D9DCE3] bg-[#F0F2F5] opacity-60"
            disabled
            aria-disabled
            title="Aún sin repartidor"
          >
            <span className="sr-only">Contactar</span>
            {/* Opcional: Añadir un ícono de teléfono deshabilitado aquí */}
          </button>
        )}
      </div>
    </div>
  );
}
