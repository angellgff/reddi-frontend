"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/client";
import RouteMap from "../checkout/RouteMap";

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
  const first = typeof user.first_name === "string" ? user.first_name : "";
  const last = typeof user.last_name === "string" ? user.last_name : "";
  const full = `${first} ${last}`.trim();
  return full || emailPrefix || "Repartidor";
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
  const pollRef = useRef<NodeJS.Timeout | null>(null); // Usar NodeJS.Timeout para mayor compatibilidad

  // Ruta inicial ya proviene de server action, no se hace fetch aquí.

  // Poll for driver assignment until delivered or assigned
  useEffect(() => {
    // LOG: Indica cuándo se activa el efecto y con qué props.
    console.log(
      `--- OrderLiveStatusClient useEffect [orderId: ${orderId}] ---`,
      { delivered }
    );

    async function loadDriver() {
      // LOG: Muestra que la función de búsqueda ha comenzado.
      console.log(
        `🚀 [loadDriver] Buscando repartidor para el pedido: ${orderId}`
      );
      setLoadingDriver(true);
      try {
        const supabase = await createClient();

        // Maneja éxito de forma consistente
        const handleSuccess = (user: any, source: string) => {
          console.log(
            `✅ [ÉXITO] Repartidor encontrado a través de '${source}':`,
            user
          );
          const driverData = {
            assigned: true,
            name: displayName(user),
            avatar_url: null as string | null, // No existe en perfiles
            phone: user?.phone_number ?? null,
          };
          setDelivery(driverData);
          console.log("📞 Estableciendo estado 'delivery' a:", driverData);
          if (pollRef.current) clearInterval(pollRef.current);
          return true;
        };

        // Único intento: shipments -> drivers -> profiles (según tipos generados)
        try {
          console.log(
            "    [Intento único] Consultando 'shipments' con joins..."
          );
          const { data: ship, error: shipErr } = await supabase
            .from("shipments")
            .select(
              `id, order_id, driver_id,
               driver:drivers!shipments_driver_id_fkey(
                 id,
                 user:profiles!drivers_user_id_fkey(
                   id, first_name, last_name, email, phone_number
                 )
               )`
            )
            .eq("order_id", orderId)
            .maybeSingle();

          console.log("    [Intento único] Respuesta:", {
            ship,
            error: shipErr,
          });

          const user = (ship as any)?.driver?.user;
          if (!shipErr && ship && user) {
            if (handleSuccess(user, "shipments")) return;
          }
        } catch (e) {
          console.error("    [Intento único] Ocurrió una excepción:", e);
        }

        console.log("   [FIN] No se encontró un repartidor asignado aún.");
      } catch (e) {
        console.error("💥 Error general en la función loadDriver:", e);
      } finally {
        setLoadingDriver(false);
      }
    }

    // Carga inicial
    loadDriver();

    if (delivered) {
      // LOG: Si el pedido ya fue entregado, no se hace sondeo.
      console.log("📦 Pedido ya entregado, no se iniciará el sondeo.");
    }

    // Limpiar cualquier intervalo anterior antes de crear uno nuevo.
    if (pollRef.current) clearInterval(pollRef.current);

    // LOG: Informa que el sondeo se va a configurar.
    console.log("⏰ Configurando sondeo cada 15 segundos...");
    pollRef.current = setInterval(() => {
      // Usa una función de callback con el estado más reciente para evitar problemas de "stale state"
      setDelivery((currentDelivery) => {
        console.log(
          `   [Sondeo] Verificando... ¿Repartidor asignado? ${currentDelivery.assigned}`
        );
        if (!currentDelivery.assigned) {
          console.log("   [Sondeo] No asignado. Volviendo a buscar...");
          loadDriver();
        } else {
          // LOG: Si ya está asignado, el sondeo se detiene.
          console.log("   [Sondeo] Repartidor ya asignado. Deteniendo sondeo.");
          if (pollRef.current) clearInterval(pollRef.current);
        }
        return currentDelivery; // No se modifica el estado aquí
      });
    }, 15000); // cada 15s

    // Función de limpieza del efecto
    return () => {
      // LOG: Informa que el componente se desmonta o el efecto se vuelve a ejecutar.
      console.log("🧹 Limpiando intervalo de sondeo.");
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, delivered]);

  return (
    <div className="rounded-2xl border border-[#D9DCE3] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.1),0_1px_4px_rgba(12,12,13,0.05)] flex flex-col">
      {/* Map placeholder / route */}
      <div className="h-[300px] w-full rounded-xl bg-[url('/placeholder-map.png')] bg-cover bg-center relative overflow-hidden">
        {route?.origin && route?.destination ? (
          <RouteMap
            origin={route.origin}
            destination={route.destination}
            routeGeoJson={route.routeGeoJson ?? undefined}
            height={400}
          />
        ) : (
          <div className="h-[400px] w-full rounded-xl bg-[url('/placeholder-map.png')] bg-cover bg-center" />
        )}
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
