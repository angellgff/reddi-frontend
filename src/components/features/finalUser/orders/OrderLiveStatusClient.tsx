"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/client";

interface Props {
  orderId: string;
  delivered?: boolean;
  initialRoute?: {
    origin?: { longitude: number; latitude: number } | null;
    destination?: { longitude: number; latitude: number } | null;
    routeGeoJson?: {
      type: "LineString";
      coordinates: [number, number][];
    } | null;
  };
}

type RouteData = {
  origin?: { longitude: number; latitude: number } | null;
  destination?: { longitude: number; latitude: number } | null;
  routeGeoJson?: { type: "LineString"; coordinates: [number, number][] } | null;
};

interface DeliveryAssignment {
  assigned: boolean;
  name?: string;
  avatar_url?: string | null;
  phone?: string | null;
}

function displayName(user: any): string {
  if (!user) return "Repartidor";
  const emailPrefix =
    typeof user.email === "string" ? user.email.split("@")[0] : "";
  return (
    user.full_name ||
    user.name ||
    user.first_name ||
    emailPrefix ||
    "Repartidor"
  );
}

export default function OrderLiveStatusClient({
  orderId,
  delivered,
  initialRoute,
}: Props) {
  const [route] = useState<RouteData>({
    origin: initialRoute?.origin,
    destination: initialRoute?.destination,
    routeGeoJson: initialRoute?.routeGeoJson,
  });
  const [delivery, setDelivery] = useState<DeliveryAssignment>({
    assigned: false,
  });
  const [loadingDriver, setLoadingDriver] = useState(false);
  const pollRef = useRef<number | null>(null);

  // Ruta inicial ya proviene de server action, no se hace fetch aquí.

  // Poll for driver assignment until delivered or assigned
  useEffect(() => {
    async function loadDriver() {
      setLoadingDriver(true);
      try {
        const supabase = createClient();

        // Try: direct FK on orders
        try {
          const { data: ord, error } = await supabase
            .from("orders")
            .select(
              "id, delivery_user:profiles!orders_delivery_user_id_fkey(id, full_name, name, first_name, email, avatar_url, phone)"
            )
            .eq("id", orderId)
            .single();
          const u = (ord as any)?.delivery_user;
          if (!error && ord && u) {
            setDelivery({
              assigned: true,
              name: displayName(u),
              avatar_url: u?.avatar_url ?? null,
              phone: u?.phone ?? null,
            });
            return; // stop further attempts
          }
        } catch {}

        // Try: delivery_assignments
        try {
          const { data: da, error: daErr } = await supabase
            .from("delivery_assignments")
            .select(
              "id, order_id, delivery_user:profiles(id, full_name, name, first_name, email, avatar_url, phone)"
            )
            .eq("order_id", orderId)
            .maybeSingle();
          const u = (da as any)?.delivery_user;
          if (!daErr && da && u) {
            setDelivery({
              assigned: true,
              name: displayName(u),
              avatar_url: u?.avatar_url ?? null,
              phone: u?.phone ?? null,
            });
            return;
          }
        } catch {}

        // Try: deliveries
        try {
          const { data: del, error: delErr } = await supabase
            .from("deliveries")
            .select(
              "id, order_id, driver:profiles(id, full_name, name, first_name, email, avatar_url, phone)"
            )
            .eq("order_id", orderId)
            .maybeSingle();
          const u = (del as any)?.driver;
          if (!delErr && del && u) {
            setDelivery({
              assigned: true,
              name: displayName(u),
              avatar_url: u?.avatar_url ?? null,
              phone: u?.phone ?? null,
            });
            return;
          }
        } catch {}
      } finally {
        setLoadingDriver(false);
      }
    }

    // Initial load
    loadDriver();
    if (delivered) return; // no polling if already delivered
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      // Only poll if not assigned yet
      if (!delivery.assigned) loadDriver();
    }, 15000); // every 15s
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, delivered]);

  return (
    <div className="rounded-2xl border border-[#D9DCE3] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_4px_rgba(12,12,13,0.05)] flex flex-col">
      {/* Map placeholder / route */}
      <div className="h-[300px] w-full rounded-xl bg-[url('/placeholder-map.png')] bg-cover bg-center relative overflow-hidden">
        {/* Aquí se podría renderizar un mapa real usando route.routeGeoJson */}
      </div>
      {/* Driver card */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-[#9BA1AE] bg-[rgba(240,242,245,0.72)] p-3">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-gray-300 overflow-hidden relative">
            {delivery.assigned && delivery.avatar_url ? (
              <Image
                src={delivery.avatar_url}
                alt={delivery.name || "Repartidor"}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <div>
            <div className="text-[16px] leading-5 font-medium text-[#171717]">
              {delivery.assigned
                ? delivery.name
                : loadingDriver
                ? "Buscando repartidor..."
                : "Sin repartidor asignado"}
            </div>
            <div className="text-[14px] leading-[18px] text-[#292929]">
              {delivery.assigned
                ? "Repartidor asignado"
                : "Esperando asignación"}
            </div>
          </div>
        </div>
        <button
          className={
            delivery.assigned
              ? "inline-flex items-center justify-center rounded-full border border-[#04BD88] bg-[#CDF7E7] h-[51px] w-[51px]"
              : "inline-flex items-center justify-center rounded-full border border-[#D9DCE3] bg-[#F0F2F5] h-[51px] w-[51px] opacity-60 cursor-not-allowed"
          }
          disabled={!delivery.assigned}
          aria-disabled={!delivery.assigned}
          title={delivery.assigned ? "Contactar" : "Aún sin repartidor"}
        >
          <span className="sr-only">Contactar</span>
        </button>
      </div>
      <div className="mt-4 flex gap-4 flex-wrap">
        <a
          className="inline-flex items-center justify-center rounded-xl bg-[#04BD88] px-5 py-2.5 text-white text-sm font-medium"
          href="#"
        >
          Contactar Restaurante
        </a>
        <button className="inline-flex items-center justify-center rounded-xl border border-black px-5 py-2.5 text-sm font-medium">
          Cancelar Pedido
        </button>
      </div>
    </div>
  );
}
