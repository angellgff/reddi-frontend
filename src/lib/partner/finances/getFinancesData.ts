import { createClient } from "@/src/lib/supabase/server";

export type RawFinanceRow = {
  id: string;
  created_at: string;
  total_amount: number;
  shipping_fee: number | null;
  status: string | null;
};

export type FinancesResult = {
  rows: RawFinanceRow[];
  page: number;
  totalPages: number;
  stats: {
    todayIncome: number;
    weekIncome: number; // usamos esto para "Más Vendidos" (supuesto: ventas de la semana)
    monthIncome: number;
    ordersCompleted: number; // del mes
    commissions: number; // sum(shipping_fee) del mes, como aproximación
  };
};

export async function getFinancesData(params: {
  from?: string;
  to?: string;
  status?: string; // "Pagado" | "Pendiente"
  page?: string | string[] | undefined;
  limit?: number;
}): Promise<FinancesResult> {
  const { from, to, status } = params;
  const limit = params.limit ?? 10;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      rows: [],
      page: 1,
      totalPages: 1,
      stats: {
        todayIncome: 0,
        weekIncome: 0,
        monthIncome: 0,
        ordersCompleted: 0,
        commissions: 0,
      },
    };
  }

  // Obtener partner_id para el usuario
  const { data: partnerRow } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const partnerId = partnerRow?.id;
  if (!partnerId) {
    return {
      rows: [],
      page: 1,
      totalPages: 1,
      stats: {
        todayIncome: 0,
        weekIncome: 0,
        monthIncome: 0,
        ordersCompleted: 0,
        commissions: 0,
      },
    };
  }

  // Base query para la tabla (con filtros y paginación).
  let baseQuery = supabase
    .from("orders")
    .select("id, created_at, total_amount, shipping_fee, status", {
      count: "exact",
    })
    .eq("partner_id", partnerId);

  if (from) {
    baseQuery = baseQuery.gte("created_at", new Date(from).toISOString());
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    baseQuery = baseQuery.lte("created_at", toDate.toISOString());
  }
  if (status) {
    const s = status.toLowerCase();
    if (s === "pagado") {
      baseQuery = baseQuery.eq("status", "delivered");
    } else if (s === "pendiente") {
      baseQuery = baseQuery.in("status", [
        "new",
        "pending",
        "confirmed",
        "preparing",
        "on_the_way",
      ]);
    }
  }

  const fromIdx = (page - 1) * limit;
  const toIdx = fromIdx + limit - 1;
  baseQuery = baseQuery
    .order("created_at", { ascending: false })
    .range(fromIdx, toIdx);

  const { data, error, count } = await baseQuery;
  if (error) {
    console.error("getFinancesData error", error);
  }

  const rows: RawFinanceRow[] = (data ?? []).map((r: any) => ({
    id: r.id,
    created_at: r.created_at,
    total_amount: r.total_amount ?? 0,
    shipping_fee: r.shipping_fee ?? 0,
    status: r.status ?? null,
  }));

  const totalPages = count ? Math.max(1, Math.ceil(count / limit)) : 1;

  // Estadísticas (reales) ----------------------------------
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diffToMonday = (day + 6) % 7; // 0->dom, 1->lun...
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const deliveredFilter = (q: any) =>
    q.eq("partner_id", partnerId).eq("status", "delivered");

  const [
    { data: today },
    { data: week },
    { data: month },
    { count: monthDeliveredCount },
  ] = await Promise.all([
    deliveredFilter(
      supabase.from("orders").select("total_amount, created_at")
    ).gte("created_at", startOfDay.toISOString()),
    deliveredFilter(
      supabase.from("orders").select("total_amount, created_at")
    ).gte("created_at", startOfWeek.toISOString()),
    deliveredFilter(
      supabase.from("orders").select("total_amount, created_at, shipping_fee")
    ).gte("created_at", startOfMonth.toISOString()),
    deliveredFilter(
      supabase.from("orders").select("id", { count: "exact", head: true })
    ).gte("created_at", startOfMonth.toISOString()),
  ]);

  const sum = (arr: any[] | null | undefined, key: string) =>
    (arr ?? []).reduce((acc, x) => acc + (x?.[key] || 0), 0);

  const todayIncome = sum(today, "total_amount");
  const weekIncome = sum(week, "total_amount");
  const monthIncome = sum(month, "total_amount");
  const commissions = sum(month, "shipping_fee"); // aproximación temporal

  return {
    rows,
    page,
    totalPages,
    stats: {
      todayIncome,
      weekIncome,
      monthIncome,
      ordersCompleted: monthDeliveredCount ?? 0,
      commissions,
    },
  };
}
