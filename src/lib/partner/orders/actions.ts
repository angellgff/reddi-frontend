"use server";

import { createClient } from "@/src/lib/supabase/server";
import {
  PartnerOrderCardProps,
  OrderStatus,
} from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";

function mapStatus(s: string | null | undefined): OrderStatus {
  const v = (s ?? "").toLowerCase();
  if (v === "confirmed") return "new";
  if (
    v === "scheduled" ||
    v === "programmed" ||
    v === "programada" ||
    v === "programado"
  )
    return "scheduled";
  if (v === "preparing") return "preparation";
  if (v === "on_the_way") return "preparation";
  if (v === "delivered") return "delivered";
  if (v === "canceled") return "canceled";
  return "pending";
}

function minutesRemaining(
  createdAt: string,
  status: OrderStatus,
  scheduledAt?: string | null
): number {
  if (status === "scheduled" && scheduledAt) {
    const diffMin = Math.ceil((new Date(scheduledAt).getTime() - Date.now()) / 60000);
    return Math.max(0, diffMin);
  }

  const ETA_MIN = 20;
  const start = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - start) / 60000);
  return Math.max(0, ETA_MIN - diffMin);
}

export async function fetchOrderCardData(
  orderId: string
): Promise<PartnerOrderCardProps | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, status, total_amount, payment_intent_id, scheduled_at, user_id, order_detail(quantity, unit_price, products(name))"
    )
    .eq("id", orderId)
    .single();

  if (error || !order) return null;

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", order.user_id)
    .single();

  const items = Array.isArray(order.order_detail) ? order.order_detail : [];
  const productsCount = items.reduce(
    (s: number, it) => s + (it.quantity ?? 0),
    0
  );
  const paymentMethod = order.payment_intent_id ? "Tarjeta" : "Débito";
  const deliveryTime = order.scheduled_at
    ? new Date(order.scheduled_at).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Lo antes posible";

  const fullName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const mappedStatus = mapStatus(order.status);

  return {
    customerName: fullName || "Cliente",
    orderId: order.id,
    status: mappedStatus,
    timeRemaining: minutesRemaining(order.created_at, mappedStatus, order.scheduled_at),
    products: `${productsCount} producto(s)`,
    total: order.total_amount ?? 0,
    paymentMethod,
    deliveryTime,
  };
}
