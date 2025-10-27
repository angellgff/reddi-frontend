import { createClient } from "@/src/lib/supabase/server";
import type { Order } from "@/src/lib/partner/dashboard/type";
import {
  ACTIVE_ORDER_STATUSES,
  orderStatusToUILabel,
} from "@/src/lib/partner/dashboard/utils/orderStatus";

function timeFromIso(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default async function getOrdersData(): Promise<Order[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const partnerId = partner?.id;
  if (!partnerId) return [];

  // Fetch recent active orders for this partner
  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, status, scheduled_at, instructions")
    .eq("partner_id", partnerId)
    .in("status", ACTIVE_ORDER_STATUSES)
    .order("created_at", { ascending: false })
    .limit(10);

  return (orders || []).map((o) => {
    const name = `Pedido #${String(o.id).slice(0, 6)}`;
    const when = timeFromIso(o.scheduled_at || o.created_at);
    const mode = "Delivery"; // Ajustable si agregas origen en orders
    return {
      id: String(o.id),
      name,
      details: `${mode} - ${when}`,
      status: orderStatusToUILabel(o.status) as Order["status"],
    } as Order;
  });
}
