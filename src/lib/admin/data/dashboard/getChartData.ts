import { createClient } from "@/src/lib/supabase/server";

function startOfUTCDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export type RevenuePoint = { date: string; total: number };

export default async function getChartData(): Promise<RevenuePoint[]> {
  const supabase = await createClient();
  const startIso = startOfUTCDateDaysAgo(6); // last 7 days including today
  const { data, error } = await supabase
    .from("orders")
    .select("created_at, total_amount")
    .gte("created_at", startIso)
    .order("created_at", { ascending: true });

  // Always build the last 7 days timeline, even on error
  const buckets = new Map<string, number>();
  if (!error && data) {
    for (const row of data as any[]) {
      const day = (row.created_at as string).slice(0, 10); // YYYY-MM-DD
      const prev = buckets.get(day) || 0;
      buckets.set(day, prev + Number(row.total_amount || 0));
    }
  }

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (!buckets.has(key)) buckets.set(key, 0);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, total]) => ({ date, total: Number((total || 0).toFixed(2)) }));
}
