// src/app/admin/dashboard/ChartServer.tsx (o donde esté ubicado)

// Importa el nuevo componente de gráfico
import RevenueLineChart from "@/src/components/features/admin/dashboard/chart/RevenueLineChart";
import getChartData from "@/src/lib/admin/data/dashboard/getChartData";
import CardShell from "../../CardShell";

export default async function ChartServer() {
  const data = await getChartData();

  return (
    <CardShell title="Evolución de Ingresos">
      {/* El padding y borde ahora están en CardShell, o los puedes poner aquí */}
      <div className="p-4 bg-white border rounded-lg">
        <RevenueLineChart data={data} />
      </div>
    </CardShell>
  );
}
