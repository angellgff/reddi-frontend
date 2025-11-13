import CardShell from "../../CardShell";
import type { RevenuePoint } from "@/src/lib/admin/data/dashboard/getChartData";

export default function ChartCard({ data }: { data: RevenuePoint[] }) {
  // Simple bars using divs; Y max auto from data
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <CardShell title="Evolución de Ingresos (7 días)">
      <div className="h-80 rounded-lg p-4 bg-white border">
        <div className="flex items-end gap-2 h-full">
          {data.map((p) => {
            const heightPct = Math.round((p.total / max) * 100);
            return (
              <div key={p.date} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-emerald-500 rounded-t"
                  style={{ height: `${heightPct}%` }}
                  title={`$${p.total.toFixed(2)}`}
                />
                <div className="mt-1 text-[10px] text-gray-500">
                  {p.date.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CardShell>
  );
}
