import { createClient } from "@/src/lib/supabase/server";
import {
  PartnerOrderCardProps,
  OrderStatus,
} from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import type { Enums } from "@/src/lib/database.types";

type OrderDbStatus = Enums<"order_status">;

export type OrderIndicatorCounts = {
  active: number;
  pending: number;
  preparation: number;
  delivered: number;
  scheduled: number;
};

async function getCurrentPartnerId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: partner, error: partnerErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (partnerErr) {
    console.error("[orders] partner lookup error", partnerErr);
    return null;
  }

  return partner?.id ?? null;
}

// Mapear estados de orders.status (cliente) -> estados de tarjeta del partner
function mapStatus(
  s: string | null | undefined,
  scheduledAt?: string | null,
): OrderStatus {
  const v = (s ?? "").toLowerCase();
  if (
    scheduledAt &&
    new Date(scheduledAt).getTime() > Date.now() &&
    ["pending", "preparing"].includes(v)
  ) {
    return "scheduled";
  }
  if (v === "pending") return "pending";
  if (v === "preparing") return "preparation";
  if (v === "out_for_delivery") return "preparation";
  if (v === "delivered") return "delivered";
  if (v === "cancelled") return "canceled";
  return "canceled";
}

function minutesFromCreatedAt(
  createdAt: string,
  status: OrderStatus,
  scheduledAt?: string | null,
): number {
  if (status === "scheduled" && scheduledAt) {
    const diffMin = Math.ceil(
      (new Date(scheduledAt).getTime() - Date.now()) / 60000,
    );
    return Math.max(0, diffMin);
  }

  const start = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - start) / 60000);
  return Math.max(0, diffMin);
}

export default async function getOrdersListData(
  category: string | string[] | undefined,
  cursor?: string | string[] | undefined,
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
    .eq("is_active", true)
    .maybeSingle();
  if (partnerErr) {
    console.error("[orders] partner lookup error", partnerErr);
    return [];
  }
  if (!partner?.id) return [];

  // Filtros por categoría
  const cat = Array.isArray(category) ? (category[0] ?? "") : (category ?? "");
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const pageSize = 20;
  const scheduledFilterStatuses: OrderDbStatus[] = ["pending", "preparing"];
  const pendingFilterStatuses: OrderDbStatus[] = ["pending"];
  const preparationFilterStatuses: OrderDbStatus[] = [
    "preparing",
    "out_for_delivery",
  ];

  let query = supabase
    .from("orders")
    .select(
      "id, created_at, status, total_amount, payment_intent_id, scheduled_at, user_id, order_detail(quantity, unit_price)",
    )
    .eq("partner_id", partner.id)
    // Excluir pedidos que no se han pagado o fallaron
    .neq("status", "awaiting_payment")
    .neq("status", "payment_failed")
    .order("created_at", { ascending: false })
    .range(0, pageSize - 1);

  if (cat === "today") {
    query = query.gte("created_at", todayStart.toISOString());
  } else if (cat === "scheduled") {
    query = query
      .not("scheduled_at", "is", null)
      .gte("scheduled_at", new Date().toISOString())
      .in("status", scheduledFilterStatuses);
  } else if (cat === "pending") {
    query = query.in("status", pendingFilterStatuses);
  } else if (cat === "preparation") {
    query = query.in("status", preparationFilterStatuses);
  } else if (cat === "delivered") {
    query = query.eq("status", "delivered");
  }

  const cur = Array.isArray(cursor) ? cursor[0] : cursor;
  if (cur) {
    query = query.lt("created_at", cur);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[orders] list query error", error);
    return [];
  }

  // Join manual con profiles para obtener el nombre del cliente
  const userIds = Array.from(
    new Set((data ?? []).map((o) => o.user_id).filter(Boolean)),
  );
  const profilesMap = new Map<
    string,
    { first_name: string | null; last_name: string | null }
  >();
  if (userIds.length > 0) {
    const { data: profs, error: profErr } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", userIds);
    if (profErr) throw profErr;
    (profs ?? []).forEach((p) => {
      profilesMap.set(p.id, {
        first_name: p.first_name ?? null,
        last_name: p.last_name ?? null,
      });
    });
  }

  // Adaptar al shape de PartnerOrderCardProps
  const list: PartnerOrderCardProps[] = (data ?? []).map((o) => {
    const mappedStatus = mapStatus(o.status);
    const mappedStatusWithSchedule = mapStatus(o.status, o.scheduled_at);
    const items = Array.isArray(o.order_detail) ? o.order_detail : [];
    const productsCount = items.reduce(
      (s: number, it) => s + (it.quantity ?? 0),
      0,
    );
    const paymentMethod = o.payment_intent_id ? "Tarjeta" : "Débito";
    const deliveryTime = o.scheduled_at
      ? new Date(o.scheduled_at).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Lo antes posible";
    const prof = profilesMap.get(o.user_id);
    const fullName = [prof?.first_name, prof?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return {
      customerName: fullName || "Cliente",
      orderId: o.id,
      status: mappedStatusWithSchedule,
      timeRemaining: minutesFromCreatedAt(
        o.created_at,
        mappedStatusWithSchedule,
        o.scheduled_at,
      ),
      products: `${productsCount} producto(s)`,
      total: o.total_amount ?? 0,
      paymentMethod,
      deliveryTime,
    } as PartnerOrderCardProps;
  });

  return list;
}

export async function getOrderIndicatorCounts(): Promise<OrderIndicatorCounts> {
  const supabase = await createClient();
  const partnerId = await getCurrentPartnerId();
  if (!partnerId) {
    return {
      active: 0,
      pending: 0,
      preparation: 0,
      delivered: 0,
      scheduled: 0,
    };
  }

  const nowIso = new Date().toISOString();

  const createCountBase = () =>
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .neq("status", "awaiting_payment")
      .neq("status", "payment_failed");

  const [pendingNow, preparationNow, delivered, scheduled] = await Promise.all([
    createCountBase()
      .eq("status", "pending")
      .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`),
    createCountBase()
      .in("status", ["preparing", "out_for_delivery"])
      .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`),
    createCountBase().eq("status", "delivered"),
    createCountBase()
      .in("status", ["pending", "preparing"])
      .not("scheduled_at", "is", null)
      .gt("scheduled_at", nowIso),
  ]);

  const pendingCount = pendingNow.count ?? 0;
  const preparationCount = preparationNow.count ?? 0;
  const deliveredCount = delivered.count ?? 0;
  const scheduledCount = scheduled.count ?? 0;

  return {
    pending: pendingCount,
    preparation: preparationCount,
    delivered: deliveredCount,
    scheduled: scheduledCount,
    active: pendingCount + preparationCount + scheduledCount,
  };
}

export async function getScheduledOrdersCount(): Promise<number> {
  const counts = await getOrderIndicatorCounts();
  return counts.scheduled;
}
