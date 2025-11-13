import { createClient } from "@/src/lib/supabase/server";
import type { Tables, Enums } from "@/src/lib/database.types";

export type OrderStatus = Enums<"order_status">;
export type PartnerType = Enums<"partner_type">;

export type OrderListItem = {
  id: string;
  created_at: string;
  status: OrderStatus | null;
  total_amount: number;
  user_id: string;
  customerName?: string;
  partnerName?: string | null;
  partner_type?: PartnerType | null;
};

export type OrderFilters = {
  search?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  status?: OrderStatus | "";
  category?: PartnerType | ""; // partner_type
};

// Helpers
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

export default async function getOrders(
  filters: OrderFilters = {},
  limit = 20,
  offset = 0
): Promise<OrderListItem[]> {
  const supabase = await createClient();

  const baseSelect = `
    id, created_at, status, total_amount, user_id,
    profiles ( first_name, last_name ),
    partners!inner ( name, partner_type )
  `;

  let q = supabase
    .from("orders")
    .select(baseSelect)
    .order("created_at", { ascending: false });

  // Pagination
  q = q.range(offset, offset + limit - 1);

  // Filters
  const { search, from, to, status, category } = filters;

  if (status) q = q.eq("status", status as any);
  if (from) q = q.gte("created_at", `${from}T00:00:00`);
  if (to) q = q.lte("created_at", `${to}T23:59:59`);
  if (category) q = q.eq("partners.partner_type", category as any);
  if (search && search.trim()) {
    const s = search.trim();
    // Search by order id (prefix match) or partner name contains
    q = q.or(`id.ilike.%${s}%,partners.name.ilike.%${s}%`);
  }

  const { data, error } = await q;
  if (error || !data) {
    console.error("Error fetching orders", error);
    return [];
  }

  return data.map((o: any) => ({
    id: o.id,
    created_at: o.created_at,
    status: o.status,
    total_amount: o.total_amount,
    user_id: o.user_id,
    customerName: deriveName(o.profiles, o.user_id),
    partnerName: o.partners?.name ?? null,
    partner_type: o.partners?.partner_type ?? null,
  }));
}
