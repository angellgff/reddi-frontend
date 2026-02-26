"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { PartnerOrderCardProps } from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import { fetchOrderCardData } from "@/src/lib/partner/orders/actions";

export function useRealtimeOrders(
  initialOrders: PartnerOrderCardProps[],
  partnerId?: string, // Opcional: si queremos filtrar por partnerId en el cliente, aunque RLS debería manejarlo
) {
  const [orders, setOrders] = useState<PartnerOrderCardProps[]>(initialOrders);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    const supabase = createClient();

    const orderChangesConfig = {
      event: "*" as const,
      schema: "public",
      table: "orders",
      ...(partnerId ? { filter: `partner_id=eq.${partnerId}` } : {}),
    };

    const channel = supabase
      .channel(`orders_realtime_channel${partnerId ? `_${partnerId}` : ""}`)
      .on("postgres_changes", orderChangesConfig, async (payload) => {
        console.log("Realtime order event:", payload);

        if (payload.eventType === "INSERT") {
          const newOrder = payload.new;
          // Validar si es para este partner (si el payload lo trae y lo tenemos disponible)
          // Nota: RLS filtrará los eventos si la suscripción se hace correctamente con la sesión del usuario.

          const fullOrder = await fetchOrderCardData(newOrder.id);
          if (fullOrder) {
            setOrders((prev) => [fullOrder, ...prev]);
          }
        } else if (payload.eventType === "UPDATE") {
          const updatedOrder = payload.new;
          // Si cambia el estado, podríamos querer actualizar la tarjeta o moverla si hay filtros activos.
          // Por simplicidad, actualizamos la data visual si la encontramos.

          // Optimistic update solo del status si mapea fácil, o fetch completo.
          // Vamos a hacer fetch completo para asegurar consistencia.
          const fullOrder = await fetchOrderCardData(updatedOrder.id);

          if (fullOrder) {
            setOrders((prev) =>
              prev.map((o) =>
                o.orderId === fullOrder.orderId ? fullOrder : o,
              ),
            );
          }
        } else if (payload.eventType === "DELETE") {
          const deletedId = payload.old.id;
          setOrders((prev) => prev.filter((o) => o.orderId !== deletedId));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId]);

  return orders;
}
