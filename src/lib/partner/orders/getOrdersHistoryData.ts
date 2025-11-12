import { createClient } from "@/src/lib/supabase/server";

export type OrderHistoryRow = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  user_id: string | null;
};

export type OrderHistoryResult = {
  rows: OrderHistoryRow[];
  page: number;
  totalPages: number;
};

export async function getOrdersHistoryData(params: {
  from?: string;
  to?: string;
  status?: string;
  page?: string | string[] | undefined;
  limit?: number;
}): Promise<OrderHistoryResult> {
  const { from, to, status } = params;
  const limit = params.limit ?? 10;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { rows: [], page: 1, totalPages: 1 }; // no autenticado

  // Obtener partner_id
  const { data: partnerRow } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  const partnerId = partnerRow?.id;
  if (!partnerId) return { rows: [], page: 1, totalPages: 1 }; // sin partner

  let baseQuery = supabase
    .from("orders")
    .select("id, created_at, total_amount, status, user_id", { count: "exact" })
    .eq("partner_id", partnerId);

  if (from) {
    baseQuery = baseQuery.gte("created_at", new Date(from).toISOString());
  }
  if (to) {
    // incluir todo el día final (23:59:59)
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    baseQuery = baseQuery.lte("created_at", toDate.toISOString());
  }
  if (status) {
    // mapear UI status -> internal statuses
    const s = status.toLowerCase();
    let internalStatuses: string[] | null = null;
    if (s === "pendiente")
      internalStatuses = [
        "confirmed",
        "new",
        "pending",
      ]; // confirmed & pending equivalentes
    else if (s === "entregado") internalStatuses = ["delivered"];
    else if (s === "cancelado") internalStatuses = ["canceled"];
    if (internalStatuses) baseQuery = baseQuery.in("status", internalStatuses);
  }

  // paginación offset
  const fromIdx = (page - 1) * limit;
  const toIdx = fromIdx + limit - 1;
  baseQuery = baseQuery
    .order("created_at", { ascending: false })
    .range(fromIdx, toIdx);

  const { data, error, count } = await baseQuery;
  if (error) {
    console.error("getOrdersHistoryData error", error);
    return { rows: [], page: 1, totalPages: 1 };
  }
  const totalPages = count ? Math.max(1, Math.ceil(count / limit)) : 1;

  return {
    rows: (data ?? []).map((r: any) => ({
      id: r.id,
      created_at: r.created_at,
      total_amount: r.total_amount ?? 0,
      status: r.status ?? "pending",
      user_id: r.user_id ?? null,
    })),
    page,
    totalPages,
  };
}
