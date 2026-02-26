import { createClient } from "@/src/lib/supabase/server";

export type PartnerWeeklyRevenuePoint = {
  day: string;
  "Esta semana": number;
  "Semana anterior": number;
};

const chartDayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function startOfUTCDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function getRevenueChartData(): Promise<
  PartnerWeeklyRevenuePoint[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return chartDayNames.map((day) => ({
      day,
      "Esta semana": 0,
      "Semana anterior": 0,
    }));
  }

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!partner?.id) {
    return chartDayNames.map((day) => ({
      day,
      "Esta semana": 0,
      "Semana anterior": 0,
    }));
  }

  const today = new Date();
  const dayOfWeek = today.getUTCDay();
  const daysToSubtractForMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startIso = startOfUTCDateDaysAgo(daysToSubtractForMonday + 7);

  const { data } = await supabase
    .from("orders")
    .select("created_at, total_amount")
    .eq("partner_id", partner.id)
    .eq("status", "delivered")
    .gte("created_at", startIso)
    .order("created_at", { ascending: true });

  const dailyTotals = new Map<string, number>();
  if (data) {
    for (const row of data) {
      const day = row.created_at.slice(0, 10);
      const prevTotal = dailyTotals.get(day) || 0;
      dailyTotals.set(day, prevTotal + (row.total_amount || 0));
    }
  }

  const chartData: PartnerWeeklyRevenuePoint[] = [];
  const thisWeeksMonday = new Date();
  thisWeeksMonday.setUTCDate(today.getUTCDate() - daysToSubtractForMonday);

  for (let i = 0; i < 7; i++) {
    const currentWeekDate = new Date(thisWeeksMonday);
    currentWeekDate.setUTCDate(thisWeeksMonday.getUTCDate() + i);
    const currentWeekKey = currentWeekDate.toISOString().slice(0, 10);

    const previousWeekDate = new Date(currentWeekDate);
    previousWeekDate.setUTCDate(currentWeekDate.getUTCDate() - 7);
    const previousWeekKey = previousWeekDate.toISOString().slice(0, 10);

    chartData.push({
      day: chartDayNames[i],
      "Esta semana": Number((dailyTotals.get(currentWeekKey) || 0).toFixed(2)),
      "Semana anterior": Number(
        (dailyTotals.get(previousWeekKey) || 0).toFixed(2),
      ),
    });
  }

  return chartData;
}
