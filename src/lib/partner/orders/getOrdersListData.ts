import { createClient } from "@/src/lib/supabase/server";
import {
  PartnerOrderCardProps,
  OrderStatus,
} from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";

type Category = "" | "today" | "pending" | "preparation" | "delivered";

// Mapear estados de orders.status (cliente) -> estados de tarjeta del partner
function mapStatus(s: string | null | undefined): OrderStatus {
  const v = (s ?? "").toLowerCase();
  if (v === "confirmed") return "new";
  if (v === "preparing") return "preparation";
  if (v === "on_the_way") return "preparation";
  if (v === "delivered") return "delivered";
  if (v === "canceled") return "canceled";
  return "pending";
}

function minutesRemaining(createdAt: string): number {
  const ETA_MIN = 20; // ETA base si no hay dato
  const start = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - start) / 60000);
  return Math.max(0, ETA_MIN - diffMin);
}

export default async function getOrdersListData(
  category: string | string[] | undefined
): Promise<PartnerOrderCardProps[]> {
  const supabase = await createClient();

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Buscar el partner asociado al usuario
  const { data: partner, error: partnerErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (partnerErr) throw partnerErr;
  if (!partner?.id) return [];

  // Filtros por categoría
  const cat = Array.isArray(category) ? category[0] ?? "" : category ?? "";
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let query = supabase
    .from("orders")
    .select(
      "id, created_at, status, total_amount, payment_intent_id, scheduled_at, order_detail(quantity, unit_price, products(name))"
    )
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (cat === "today") {
    query = query.gte("created_at", todayStart.toISOString());
  } else if (cat === "pending") {
    query = query.in("status", ["confirmed"]);
  } else if (cat === "preparation") {
    query = query.in("status", ["preparing", "on_the_way"]);
  } else if (cat === "delivered") {
    query = query.eq("status", "delivered");
  }

  const { data, error } = await query;
  if (error) throw error;

  // Adaptar al shape de PartnerOrderCardProps
  const list: PartnerOrderCardProps[] = (data ?? []).map((o: any) => {
    const items = Array.isArray(o.order_detail) ? o.order_detail : [];
    const productsCount = items.reduce(
      (s: number, it: any) => s + (it.quantity ?? 0),
      0
    );
    const paymentMethod = o.payment_intent_id ? "Tarjeta" : "Efectivo";
    const deliveryTime = o.scheduled_at
      ? new Date(o.scheduled_at).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Lo antes posible";
    return {
      customerName: "Cliente",
      orderId: o.id,
      status: mapStatus(o.status),
      timeRemaining: minutesRemaining(o.created_at),
      products: `${productsCount} producto(s)`,
      total: o.total_amount ?? 0,
      paymentMethod,
      deliveryTime,
    } as PartnerOrderCardProps;
  });

  return list;
}
