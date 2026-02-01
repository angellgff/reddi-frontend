import { createClient } from "@/src/lib/supabase/server";
import { OrderData } from "@/src/lib/repartidor/type";
import type { StatusType } from "@/src/components/features/repartidor/home/orderSection/OrderCard";

// Mapear estados de DB -> etiquetas usadas en la UI del repartidor
function mapDbStatusToDeliveryLabel(status?: string | null): StatusType {
  const s = (status ?? "").toLowerCase();
  // Soportar nombres antiguos y nuevos del enum por compatibilidad
  if (s === "pending" || s === "confirmed") return "Nueva";
  if (s === "preparing") return "Preparando";
  if (s === "out_for_delivery") return "En camino";
  if (s === "delivered") return "Completado";
  // delivered / cancelled no deberían mostrarse aquí (se filtran), fallback seguro
  return "Nueva";
}

function formatDeliveryTime(
  createdAt?: string | null,
  scheduledAt?: string | null,
): string {
  try {
    if (scheduledAt) {
      const d = new Date(scheduledAt);
      return d.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (createdAt) {
      const ETA_MIN = 25;
      const diffMin = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / 60000,
      );
      const remaining = Math.max(5, ETA_MIN - diffMin);
      return `${remaining} min`;
    }
  } catch {}
  return "25 min";
}

function formatAddress(
  addr?: {
    location_type?: string | null;
    location_number?: string | null;
  } | null,
): string {
  const t = addr?.location_type ?? "";
  const n = addr?.location_number ?? "";
  const label = [t, n].filter(Boolean).join(" ");
  return label || "Dirección no disponible";
}

export default async function getOrdersData(): Promise<OrderData[]> {
  const supabase = await createClient();

  // Asegurarnos de que hay sesión (middleware ya restringe a delivery)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Obtener el ID de conductor asociado al usuario
  const { data: driverData } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const driverId = driverData?.id;

  // Traer pedidos activos recientes con joins mínimos para la tarjeta
  // Soportar ambos nombres de estado por posibles discrepancias en el esquema
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, scheduled_at, status, partners(name,image_url), user_addresses(location_type,location_number), shipments!shipments_order_id_fkey!inner(driver_id)",
    )
    // Filtrar estados activos permitidos para el driver
    .in("status", ["preparing", "out_for_delivery", "delivered"])
    .or(`driver_id.is.null,driver_id.eq.${driverId}`, {
      foreignTable: "shipments",
    })
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  const list: OrderData[] = (data ?? []).map((o) => {
    const status = mapDbStatusToDeliveryLabel(o.status);

    const pData = o.partners;
    const partner = Array.isArray(pData) ? pData[0] : pData;

    const uaData = o.user_addresses;
    const addressData = Array.isArray(uaData) ? uaData[0] : uaData;

    const restaurantName: string = partner?.name ?? "Negocio";
    const logoUrl: string = partner?.image_url ?? "/steakhouseorder.svg";
    const address: string = formatAddress(addressData ?? undefined);
    const deliveryTime = formatDeliveryTime(o.created_at, o.scheduled_at);
    const shipments = Array.isArray(o.shipments) ? o.shipments : [o.shipments];
    const isAssigned = shipments.some(
      (s: any) => s && s.driver_id === driverId,
    );

    return {
      orderId: String(o.id),
      restaurantName,
      address,
      deliveryTime,
      logoUrl,
      status,
      isAssigned,
    } satisfies OrderData;
  });

  return list;
}
