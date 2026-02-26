import { createClient } from "@/src/lib/supabase/server";

export type RawFinanceRow = {
  id: string;
  created_at: string;
  total_amount: number;
  platform_profit: number | null;
  status: string | null;
};

export type FinancesResult = {
  rows: RawFinanceRow[];
  page: number;
  totalPages: number;
  totalCount: number;
  stats: {
    todayIncome: number;
    weekIncome: number; // usamos esto para "Más Vendidos" (supuesto: ventas de la semana)
    monthIncome: number;
    ordersCompleted: number; // del mes
    commissions: number; // sum(shipping_fee) del mes, como aproximación
    trends: {
      todayIncome: number;
      weekIncome: number;
      monthIncome: number;
      ordersCompleted: number;
      commissions: number;
    };
  };
};

function sumByKey(
  arr: Record<string, unknown>[] | null | undefined,
  key: string,
) {
  return (arr ?? []).reduce((acc, item) => acc + (Number(item?.[key]) || 0), 0);
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

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
      totalCount: 0,
      stats: {
        todayIncome: 0,
        weekIncome: 0,
        monthIncome: 0,
        ordersCompleted: 0,
        commissions: 0,
        trends: {
          todayIncome: 0,
          weekIncome: 0,
          monthIncome: 0,
          ordersCompleted: 0,
          commissions: 0,
        },
      },
    };
  }

  // Obtener partner_id para el usuario
  const { data: partnerRow } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const partnerId = partnerRow?.id;
  if (!partnerId) {
    return {
      rows: [],
      page: 1,
      totalPages: 1,
      totalCount: 0,
      stats: {
        todayIncome: 0,
        weekIncome: 0,
        monthIncome: 0,
        ordersCompleted: 0,
        commissions: 0,
        trends: {
          todayIncome: 0,
          weekIncome: 0,
          monthIncome: 0,
          ordersCompleted: 0,
          commissions: 0,
        },
      },
    };
  }

  // Base query para la tabla (con filtros y paginación).
  let baseQuery = supabase
    .from("orders")
    .select("id, created_at, total_amount, platform_profit, status", {
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
        "pending",
        "preparing",
        "out_for_delivery",
        "awaiting_payment",
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

  const rows: RawFinanceRow[] = (data ?? []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    total_amount: r.total_amount ?? 0,
    platform_profit: r.platform_profit ?? 0,
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

  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const elapsedTodayMs = now.getTime() - startOfDay.getTime();
  const startOfYesterday = new Date(startOfDay);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const endOfYesterdayWindow = new Date(
    startOfYesterday.getTime() + elapsedTodayMs,
  );

  const elapsedWeekMs = now.getTime() - startOfWeek.getTime();
  const endOfPrevWeekWindow = new Date(
    startOfPrevWeek.getTime() + elapsedWeekMs,
  );

  const elapsedMonthMs = now.getTime() - startOfMonth.getTime();
  const endOfPrevMonthWindow = new Date(
    startOfPrevMonth.getTime() + elapsedMonthMs,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deliveredFilter = (q: any) =>
    q.eq("partner_id", partnerId).eq("status", "delivered");

  const [
    { data: today },
    { data: yesterdayWindow },
    { data: week },
    { data: prevWeekWindow },
    { data: month },
    { data: prevMonthWindow },
    { count: monthDeliveredCount },
    { count: prevMonthDeliveredCount },
  ] = await Promise.all([
    deliveredFilter(supabase.from("orders").select("total_amount, created_at"))
      .gte("created_at", startOfDay.toISOString())
      .lt("created_at", now.toISOString()),
    deliveredFilter(supabase.from("orders").select("total_amount, created_at"))
      .gte("created_at", startOfYesterday.toISOString())
      .lt("created_at", endOfYesterdayWindow.toISOString()),
    deliveredFilter(supabase.from("orders").select("total_amount, created_at"))
      .gte("created_at", startOfWeek.toISOString())
      .lt("created_at", now.toISOString()),
    deliveredFilter(supabase.from("orders").select("total_amount, created_at"))
      .gte("created_at", startOfPrevWeek.toISOString())
      .lt("created_at", endOfPrevWeekWindow.toISOString()),
    deliveredFilter(
      supabase
        .from("orders")
        .select("total_amount, created_at, platform_profit"),
    )
      .gte("created_at", startOfMonth.toISOString())
      .lt("created_at", now.toISOString()),
    deliveredFilter(
      supabase
        .from("orders")
        .select("total_amount, created_at, platform_profit"),
    )
      .gte("created_at", startOfPrevMonth.toISOString())
      .lt("created_at", endOfPrevMonthWindow.toISOString()),
    deliveredFilter(
      supabase.from("orders").select("id", { count: "exact", head: true }),
    )
      .gte("created_at", startOfMonth.toISOString())
      .lt("created_at", now.toISOString()),
    deliveredFilter(
      supabase.from("orders").select("id", { count: "exact", head: true }),
    )
      .gte("created_at", startOfPrevMonth.toISOString())
      .lt("created_at", endOfPrevMonthWindow.toISOString()),
  ]);

  const todayIncome = sumByKey(today, "total_amount");
  const yesterdayIncome = sumByKey(yesterdayWindow, "total_amount");
  const weekIncome = sumByKey(week, "total_amount");
  const prevWeekIncome = sumByKey(prevWeekWindow, "total_amount");
  const monthIncome = sumByKey(month, "total_amount");
  const prevMonthIncome = sumByKey(prevMonthWindow, "total_amount");
  const commissions = sumByKey(month, "platform_profit");
  const prevMonthCommissions = sumByKey(prevMonthWindow, "platform_profit");

  const ordersCompleted = monthDeliveredCount ?? 0;
  const previousOrdersCompleted = prevMonthDeliveredCount ?? 0;

  const trends = {
    todayIncome: percentChange(todayIncome, yesterdayIncome),
    weekIncome: percentChange(weekIncome, prevWeekIncome),
    monthIncome: percentChange(monthIncome, prevMonthIncome),
    ordersCompleted: percentChange(ordersCompleted, previousOrdersCompleted),
    commissions: percentChange(commissions, prevMonthCommissions),
  };

  return {
    rows,
    page,
    totalPages,
    totalCount: count ?? 0,
    stats: {
      todayIncome,
      weekIncome,
      monthIncome,
      ordersCompleted,
      commissions,
      trends,
    },
  };
}
