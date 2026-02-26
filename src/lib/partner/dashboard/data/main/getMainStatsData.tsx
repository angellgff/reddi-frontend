import { createClient } from "@/src/lib/supabase/server";
import type { MainStatsData } from "../../type";
import { ACTIVE_ORDER_STATUSES } from "@/src/lib/partner/dashboard/utils/orderStatus";
import { formatCurrency } from "@/src/lib/utils";
import CommissionsCardValue from "@/src/components/features/partner/dashboard/main/CommissionsCardValue";

function getStartOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function percentageChange(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export default async function getMainStatsData(): Promise<MainStatsData[]> {
  const supabase = await createClient();

  // Current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [
      { statKey: "active_orders", value: "0", trendPercentage: 0 },
      {
        statKey: "today_earnings",
        value: formatCurrency(0),
        trendPercentage: 0,
      },
      { statKey: "delivered_orders", value: "0", trendPercentage: 0 },
      { statKey: "active_products", value: "0", trendPercentage: 0 },
      { statKey: "commissions", value: "0% / 0%" },
    ];
  }

  // Find partner id for this user
  const { data: partner } = await supabase
    .from("partners")
    .select("id, platform_commission_percentage, price_markup_percentage")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!partner?.id) {
    return [
      { statKey: "active_orders", value: "0", trendPercentage: 0 },
      {
        statKey: "today_earnings",
        value: formatCurrency(0),
        trendPercentage: 0,
      },
      { statKey: "delivered_orders", value: "0", trendPercentage: 0 },
      { statKey: "active_products", value: "0", trendPercentage: 0 },
      { statKey: "commissions", value: "0% / 0%" },
    ];
  }

  const partnerId = partner.id;
  const now = new Date();
  const startOfToday = getStartOfDay(now);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const previousMonthSameDay = new Date(startOfToday);
  previousMonthSameDay.setMonth(previousMonthSameDay.getMonth() - 1);
  const startOfPreviousReferenceDay = getStartOfDay(previousMonthSameDay);
  const endOfPreviousReferenceDay = new Date(startOfPreviousReferenceDay);
  endOfPreviousReferenceDay.setDate(endOfPreviousReferenceDay.getDate() + 1);

  // Active orders: any order not delivered/cancelled (conservatively)
  const { count: activeCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .in("status", ACTIVE_ORDER_STATUSES);

  const { count: previousReferenceActiveCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .in("status", ACTIVE_ORDER_STATUSES)
    .gte("created_at", startOfPreviousReferenceDay.toISOString())
    .lt("created_at", endOfPreviousReferenceDay.toISOString());

  const { data: deliveredRows } = await supabase
    .from("orders")
    .select("total_amount, created_at")
    .eq("partner_id", partnerId)
    .eq("status", "delivered")
    .gte("created_at", startOfPreviousReferenceDay.toISOString())
    .lt("created_at", endOfToday.toISOString());

  let todayTotal = 0;
  let todayDeliveredCount = 0;
  let previousReferenceTotal = 0;
  let previousReferenceDeliveredCount = 0;

  for (const row of deliveredRows || []) {
    const createdAt = new Date(row.created_at);
    const amount = row.total_amount || 0;

    if (createdAt >= startOfToday && createdAt < endOfToday) {
      todayTotal += amount;
      todayDeliveredCount += 1;
    } else if (
      createdAt >= startOfPreviousReferenceDay &&
      createdAt < endOfPreviousReferenceDay
    ) {
      previousReferenceTotal += amount;
      previousReferenceDeliveredCount += 1;
    }
  }

  // Active products available
  const { count: activeProducts } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .eq("is_available", true);

  const { count: previousReferenceActiveProducts } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .eq("is_available", true)
    .lt("created_at", startOfPreviousReferenceDay.toISOString());

  const activeTrend = percentageChange(
    Number(activeCount ?? 0),
    Number(previousReferenceActiveCount ?? 0),
  );
  const earningsTrend = percentageChange(todayTotal, previousReferenceTotal);
  const deliveredTrend = percentageChange(
    todayDeliveredCount,
    previousReferenceDeliveredCount,
  );
  const productsTrend = percentageChange(
    Number(activeProducts ?? 0),
    Number(previousReferenceActiveProducts ?? 0),
  );

  return [
    {
      statKey: "active_orders",
      value: String(activeCount ?? 0),
      trendPercentage: activeTrend,
    },
    {
      statKey: "today_earnings",
      value: formatCurrency(todayTotal),
      trendPercentage: earningsTrend,
    },
    {
      statKey: "delivered_orders",
      value: String(todayDeliveredCount),
      trendPercentage: deliveredTrend,
    },
    {
      statKey: "active_products",
      value: String(activeProducts ?? 0),
      trendPercentage: productsTrend,
    },
    {
      statKey: "commissions",
      value: (
        <CommissionsCardValue
          partnerId={partnerId}
          markup={partner.price_markup_percentage ?? 0}
          commission={partner.platform_commission_percentage ?? 0}
        />
      ),
    },
  ];
}
