// src/lib/admin/data/dashboard/getChartData.ts
import { createClient } from "@/src/lib/supabase/server";

// El tipo de dato no cambia
export type WeeklyRevenuePoint = {
  day: string;
  "Esta semana": number;
  "Semana anterior": number;
};

// Nombres de los días en el orden que queremos para el gráfico
const chartDayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function startOfUTCDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function getChartData(): Promise<WeeklyRevenuePoint[]> {
  const supabase = await createClient();

  // --- NUEVA LÓGICA PARA FIJAR LA SEMANA A LUNES ---
  const today = new Date();
  const dayOfWeek = today.getUTCDay(); // Dom=0, Lun=1, ..., Sáb=6
  // Calculamos cuántos días hay que retroceder para llegar al lunes de esta semana.
  // Si hoy es domingo (0), retrocedemos 6 días. Si es miércoles (3), retrocedemos 2 días.
  const daysToSubtractForMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // La fecha de inicio de la consulta debe ser el lunes de la SEMANA ANTERIOR
  // para asegurarnos de tener todos los datos necesarios (14 días en total).
  const startIso = startOfUTCDateDaysAgo(daysToSubtractForMonday + 7);
  console.log("Buscando datos desde el Lunes de la semana pasada:", startIso);

  const { data, error } = await supabase
    .from("orders")
    .select("created_at, total_amount")
    .eq("status", "delivered")
    .gte("created_at", startIso)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chart data:", error.message);
    return chartDayNames.map((day) => ({
      day,
      "Esta semana": 0,
      "Semana anterior": 0,
    }));
  }

  // La lógica para agrupar los totales por día sigue siendo la misma
  const dailyTotals = new Map<string, number>();
  if (data) {
    for (const row of data) {
      const day = row.created_at.slice(0, 10);
      const prevTotal = dailyTotals.get(day) || 0;
      dailyTotals.set(day, prevTotal + (row.total_amount || 0));
    }
  }
  console.log("Totales diarios agrupados:", Object.fromEntries(dailyTotals));

  // --- NUEVA LÓGICA PARA CONSTRUIR EL ARRAY DEL GRÁFICO ---
  const chartData: WeeklyRevenuePoint[] = [];

  // Obtenemos la fecha del lunes de la semana actual
  const thisWeeksMonday = new Date();
  thisWeeksMonday.setUTCDate(today.getUTCDate() - daysToSubtractForMonday);

  // Iteramos 7 veces, una para cada día de la semana (0=Lun, 1=Mar, ..., 6=Dom)
  for (let i = 0; i < 7; i++) {
    // Calculamos la fecha para el día actual de "Esta semana"
    const currentWeekDate = new Date(thisWeeksMonday);
    currentWeekDate.setUTCDate(thisWeeksMonday.getUTCDate() + i);
    const currentWeekKey = currentWeekDate.toISOString().slice(0, 10);

    // Calculamos la fecha para el mismo día de la "Semana anterior"
    const previousWeekDate = new Date(currentWeekDate);
    previousWeekDate.setUTCDate(currentWeekDate.getUTCDate() - 7);
    const previousWeekKey = previousWeekDate.toISOString().slice(0, 10);

    chartData.push({
      day: chartDayNames[i], // Usamos nuestro array ordenado
      "Esta semana": Number((dailyTotals.get(currentWeekKey) || 0).toFixed(2)),
      "Semana anterior": Number(
        (dailyTotals.get(previousWeekKey) || 0).toFixed(2)
      ),
    });
  }

  console.log(
    "Datos finales para el gráfico (ordenados de Lun-Dom):",
    chartData
  );
  return chartData;
}
