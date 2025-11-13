import { createClient } from "@/src/lib/supabase/server";

type StatRow = { title: string; value: string };

function startOfUTCDay(d = new Date()): string {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt.toISOString();
}

function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default async function getStatsData(): Promise<StatRow[]> {
  const supabase = await createClient();
  const todayIso = startOfUTCDay();

  // 1) Pedidos de hoy (conteo) + ventas de hoy (suma total_amount)
  let ordersToday = 0;
  let salesToday = 0;
  try {
    const { data: todayOrders, error: todayErr } = await supabase
      .from("orders")
      .select("total_amount, created_at")
      .gte("created_at", todayIso);
    if (!todayErr && Array.isArray(todayOrders)) {
      ordersToday = todayOrders.length;
      salesToday = todayOrders.reduce(
        (acc, r: any) => acc + Number(r.total_amount || 0),
        0
      );
    }
  } catch {}

  // 2) Repartidores activos (online o in_delivery)
  let activeDrivers = 0;
  try {
    const { count } = await supabase
      .from("drivers")
      .select("id", { count: "exact", head: true })
      .in("status", ["online", "in_delivery"] as any);
    activeDrivers = count || 0;
  } catch {}

  // 3) Aliados activos (partners aprobados)
  let activePartners = 0;
  try {
    const { count } = await supabase
      .from("partners")
      .select("id", { count: "exact", head: true })
      .eq("is_approved", true);
    activePartners = count || 0;
  } catch {}

  // 4) Usuarios nuevos hoy
  let newUsersToday = 0;
  try {
    const { count } = await supabase
      .from("normal_users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayIso);
    newUsersToday = count || 0;
  } catch {}

  const stats: StatRow[] = [
    { title: "Pedidos de hoy", value: String(ordersToday) },
    { title: "Ventas de hoy", value: formatMoney(salesToday) },
    { title: "Repartidores activos", value: String(activeDrivers) },
    { title: "Aliados activos", value: String(activePartners) },
    { title: "Usuarios nuevos", value: String(newUsersToday) },
  ];

  return stats;
}
