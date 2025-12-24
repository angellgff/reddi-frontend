import { createClient } from "@/src/lib/supabase/server";
import type { MainStatsData } from "../../type";
import { ACTIVE_ORDER_STATUSES } from "@/src/lib/partner/dashboard/utils/orderStatus";
import { formatCurrency } from "@/src/lib/utils";
import CommissionsCardValue from "@/src/components/features/partner/dashboard/main/CommissionsCardValue";

export default async function getMainStatsData(): Promise<MainStatsData[]> {
  const supabase = await createClient();

  // Current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [
      { statKey: "active_orders", value: "0" },
      { statKey: "today_earnings", value: formatCurrency(0) },
      { statKey: "delivered_orders", value: "0" },
      { statKey: "active_products", value: "0" },
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
      { statKey: "active_orders", value: "0" },
      { statKey: "today_earnings", value: formatCurrency(0) },
      { statKey: "delivered_orders", value: "0" },
      { statKey: "active_products", value: "0" },
      { statKey: "commissions", value: "0% / 0%" },
    ];
  }

  const partnerId = partner.id;

  // Active orders: any order not delivered/cancelled (conservatively)
  const { count: activeCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .in("status", ACTIVE_ORDER_STATUSES);

  // Delivered today earnings and count
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data: todayDelivered } = await supabase
    .from("orders")
    .select("total_amount, created_at, status")
    .eq("partner_id", partnerId)
    .gte("created_at", startOfDay.toISOString())
    .eq("status", "delivered");

  const todayTotal = (todayDelivered || []).reduce(
    (acc, o) => acc + (o.total_amount || 0),
    0
  );
  const todayDeliveredCount = todayDelivered?.length || 0;

  // Active products available
  const { count: activeProducts } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .eq("is_available", true);

  return [
    { statKey: "active_orders", value: String(activeCount ?? 0) },
    { statKey: "today_earnings", value: formatCurrency(todayTotal) },
    { statKey: "delivered_orders", value: String(todayDeliveredCount) },
    { statKey: "active_products", value: String(activeProducts ?? 0) },
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
