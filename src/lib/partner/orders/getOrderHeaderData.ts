"use server";

import { createClient } from "@/src/lib/supabase/server";
import { OrderStatus } from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";

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
  const ETA_MIN = 20;
  const start = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMin = Math.floor((now - start) / 60000);
  return Math.max(0, ETA_MIN - diffMin);
}

export default async function getOrderHeaderData(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, status, user_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Order not found");

  // Obtener nombre del cliente
  let customerName = "Cliente";
  if (data.user_id) {
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", data.user_id)
      .maybeSingle();
    if (profErr) throw profErr;
    if (prof) {
      customerName =
        [prof.first_name, prof.last_name].filter(Boolean).join(" ").trim() ||
        "Cliente";
    }
  }

  return {
    status: mapStatus(data.status),
    timeRemaining: minutesRemaining(data.created_at),
    customerName,
  } as const;
}
