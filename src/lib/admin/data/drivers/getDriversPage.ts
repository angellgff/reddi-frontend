import { createClient } from "@/src/lib/supabase/server";

export type DriverListItem = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  documentsStatus: "Pendientes" | "Activo" | "Cancelado" | "Shipping";
  verificationStatus: "Pendientes" | "Activo" | "Cancelado" | "Shipping";
  ordersCount: number;
};

export type DriverFilters = {
  q?: string;
};

export type DriversPageResult = {
  drivers: DriverListItem[];
  total: number;
};

const PAGE_SIZE = 10;

export default async function getDriversPage(
  filters: DriverFilters = {},
  page = 1,
  limit = PAGE_SIZE
): Promise<DriversPageResult> {
  const supabase = await createClient();

  // Query basic profile info for users with 'delivery' role
  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone_number", {
      count: "exact",
    })
    .eq("role", "delivery");

  const q = filters.q?.trim();
  if (q) {
    // Simple ilike on first_name, last_name or email
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching drivers page", error);
    return { drivers: [], total: 0 };
  }

  const drivers: DriverListItem[] = (data || []).map((row: any) => ({
    id: row.id,
    fullName: [row.first_name, row.last_name].filter(Boolean).join(" ") || "-",
    email: row.email || null,
    phone: row.phone_number || null,
    // Default statuses until dedicated columns exist
    documentsStatus: "Pendientes",
    verificationStatus: "Pendientes",
    ordersCount: 0,
  }));

  return { drivers, total: count || 0 };
}
