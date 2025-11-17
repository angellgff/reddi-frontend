import { createClient } from "@/src/lib/supabase/server";

export interface HistoryOrderItem {
  orderId: string;
  restaurantName: string;
  address: string;
  deliveredAt: string; // formatted time string
  tip: string; // formatted currency
  statusLabel: string; // Finalizado
  logoUrl: string;
}

function formatAddress(
  addr?: {
    location_type?: string | null;
    location_number?: string | null;
  } | null
): string {
  const t = addr?.location_type ?? "";
  const n = addr?.location_number ?? "";
  return [t, n].filter(Boolean).join(" ") || "Dirección no disponible";
}

function formatDeliveredTime(ts?: string | null): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return sameDay ? `Hoy,${time}` : `${d.toLocaleDateString("es-MX")} ${time}`;
  } catch {
    return "";
  }
}

function formatTip(amount?: number | null): string {
  try {
    const v = amount ?? 0;
    return v.toLocaleString("es-MX", { style: "currency", currency: "USD" });
  } catch {
    return "$0.00";
  }
}

export default async function getHistoryOrders(): Promise<HistoryOrderItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Buscar pedidos entregados asignados a este repartidor.
  // Asumimos que shipment_id referencia a shipments que tiene driver_id.
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, status, delivered_at, tip_amount, partners(name,image_url), user_addresses(location_type,location_number), shipments(driver_id)`
    )
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  const list: HistoryOrderItem[] = (data ?? [])
    .filter((o: any) => {
      // Solo mostrar si el shipment tiene driver igual al usuario.
      const driver = o.shipments?.driver_id;
      return !driver || driver === user.id; // si no hay driver filtramos? aquí permitimos mostrar entregados sin driver por seguridad.
    })
    .map((o: any) => {
      return {
        orderId: String(o.id),
        restaurantName: o.partners?.name ?? "Negocio",
        address: formatAddress(o.user_addresses ?? undefined),
        deliveredAt: formatDeliveredTime(o.delivered_at),
        tip: formatTip(o.tip_amount),
        statusLabel: "Finalizado",
        logoUrl: o.partners?.image_url ?? "/steakhouseorder.svg",
      } satisfies HistoryOrderItem;
    });

  return list;
}
