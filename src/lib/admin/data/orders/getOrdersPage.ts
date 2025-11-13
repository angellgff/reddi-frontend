import { createClient } from "@/src/lib/supabase/server";
import type { OrderFilters, OrderListItem } from "./getOrders";
import type { Tables } from "@/src/lib/database.types";

// Re-implement filtered query to retrieve a page of orders plus total count.
// We keep this separate from getOrders to avoid changing existing callers.
export type OrdersPageResult = {
  orders: OrderListItem[];
  total: number;
};

function deriveName(
  p?: Pick<Tables<"profiles">, "first_name" | "last_name"> | null,
  fallbackId?: string
) {
  if (!p) return fallbackId ? fallbackId.slice(0, 8) : "Usuario";
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return (
    full || p.first_name || (fallbackId ? fallbackId.slice(0, 8) : "Usuario")
  );
}

export default async function getOrdersPage(
  filters: OrderFilters = {},
  limit = 10,
  page = 1
): Promise<OrdersPageResult> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  const baseSelect = `
    id, created_at, status, total_amount, user_id,
    profiles ( first_name, last_name ),
    partners!inner ( name, partner_type )
  `;

  let q = supabase
    .from("orders")
    .select(baseSelect, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { search, from, to, status, category } = filters;
  if (status) q = q.eq("status", status as any);
  if (from) q = q.gte("created_at", `${from}T00:00:00`);
  if (to) q = q.lte("created_at", `${to}T23:59:59`);
  if (category) q = q.eq("partners.partner_type", category as any);
  if (search && search.trim()) {
    const s = search.trim();
    q = q.or(`id.ilike.%${s}%,partners.name.ilike.%${s}%`);
  }

  const { data, count, error } = await q;
  if (error || !data) {
    console.error("Error fetching paged orders", error);
    return { orders: [], total: 0 };
  }

  const orders: OrderListItem[] = data.map((o: any) => ({
    id: o.id,
    created_at: o.created_at,
    status: o.status,
    total_amount: o.total_amount,
    user_id: o.user_id,
    customerName: deriveName(o.profiles, o.user_id),
    partnerName: o.partners?.name ?? null,
    partner_type: o.partners?.partner_type ?? null,
  }));

  return { orders, total: count || 0 };
}
