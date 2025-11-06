"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import RouteMap from "@/src/components/features/finalUser/checkout/RouteMap";
import { createClient } from "@/src/lib/supabase/client";

type DeliveryInfo = {
  assigned: boolean;
  name?: string;
  avatar_url?: string | null;
  phone?: string | null;
};

type MinimalProfile = {
  id?: string;
  full_name?: string;
  name?: string;
  first_name?: string;
  email?: string;
  avatar_url?: string | null;
  phone?: string | null;
};

function displayName(user: MinimalProfile | null | undefined): string {
  const emailPrefix =
    typeof user?.email === "string" ? user.email.split("@")[0] : "";
  return (
    user?.full_name ||
    user?.name ||
    user?.first_name ||
    emailPrefix ||
    "Repartidor"
  );
}

export default function OrderMapAndDriver(props: {
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
      } catch {
        // ignore
      }
    }

    async function loadDelivery() {
      try {
        const supabase = createClient();
        let assigned: DeliveryInfo | null = null;

        // Try: orders with delivery_user_id -> profiles
        try {
          const { data: ordWithDriver, error: driverErr } = await supabase
            .from("orders")
            .select(
              "id, delivery_user:profiles!orders_delivery_user_id_fkey(id, full_name, name, first_name, email, avatar_url, phone)"
            )
            .eq("id", orderId)
            .single();
          const u = (
            ordWithDriver as { delivery_user?: MinimalProfile | null } | null
          )?.delivery_user;
          if (!driverErr && ordWithDriver && u) {
            assigned = {
              assigned: true,
              name: displayName(u),
              avatar_url: u?.avatar_url ?? null,
              phone: u?.phone ?? null,
            };
          }
        } catch {
          // ignore
        }

        // Try: delivery_assignments with profiles
        if (!assigned) {
          try {
            const { data: da, error: daErr } = await supabase
              .from("delivery_assignments")
              .select(
                "id, order_id, delivery_user:profiles(id, full_name, name, first_name, email, avatar_url, phone)"
              )
              .eq("order_id", orderId)
              .maybeSingle();
            const u = (da as { delivery_user?: MinimalProfile | null } | null)
              ?.delivery_user;
            if (!daErr && da && u) {
              assigned = {
                assigned: true,
                name: displayName(u),
                avatar_url: u?.avatar_url ?? null,
                phone: u?.phone ?? null,
              };
            }
          } catch {
            // ignore
          }
        }

        // Try: deliveries with driver profile
        if (!assigned) {
          try {
            const { data: del, error: delErr } = await supabase
              .from("deliveries")
              .select(
                "id, order_id, driver:profiles(id, full_name, name, first_name, email, avatar_url, phone)"
              )
              .eq("order_id", orderId)
              .maybeSingle();
            const u = (del as { driver?: MinimalProfile | null } | null)
              ?.driver;
            if (!delErr && del && u) {
              assigned = {
                assigned: true,
                name: displayName(u),
                avatar_url: u?.avatar_url ?? null,
                phone: u?.phone ?? null,
              };
            }
          } catch {
            // ignore
          }
        }

        if (mounted) setDelivery(assigned ?? { assigned: false });
      } catch {
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
          <div className="h-16 w-16 rounded-full bg-gray-300 overflow-hidden relative">
            {delivery?.assigned && delivery?.avatar_url ? (
              <Image
                src={delivery.avatar_url}
                alt={delivery.name ?? "Repartidor"}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <div>
            <div className="text-[16px] leading-5 font-medium text-[#171717]">
              {delivery?.assigned ? delivery?.name : "Sin repartidor asignado"}
            </div>
            <div className="text-[14px] leading-[18px] text-[#292929]">
              {delivery?.assigned
                ? "Repartidor asignado"
                : "Esperando asignación"}
            </div>
          </div>
        </div>
        <button
          className={
            delivery?.assigned
              ? "inline-flex items-center justify-center rounded-full border border-[#04BD88] bg-[#CDF7E7] h-[51px] w-[51px]"
              : "inline-flex items-center justify-center rounded-full border border-[#D9DCE3] bg-[#F0F2F5] h-[51px] w-[51px] opacity-60 cursor-not-allowed"
          }
          disabled={!delivery?.assigned}
          aria-disabled={!delivery?.assigned}
          title={delivery?.assigned ? "Contactar" : "Aún sin repartidor"}
        >
          <span className="sr-only">Contactar</span>
        </button>
      </div>
    </div>
  );
}
