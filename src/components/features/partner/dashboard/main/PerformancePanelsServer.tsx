import getRevenueChartData from "@/src/lib/partner/dashboard/data/main/getRevenueChartData";
import RevenueLineChart from "./RevenueLineChart";
import { Trophy } from "lucide-react";
import getTopSellingProducts from "@/src/lib/partner/dashboard/data/main/getTopSellingProducts";

const rankStyles = [
  "bg-[#FEF3C7] text-[#F59E0B]",
  "bg-[#E5E7EB] text-[#6B7280]",
  "bg-[#FED7AA] text-[#EA580C]",
  "bg-[#F3F4F6] text-[#6B7280]",
  "bg-[#F3F4F6] text-[#6B7280]",
];

export default async function PerformancePanelsServer() {
  const [chartData, topProducts] = await Promise.all([
    getRevenueChartData(),
    getTopSellingProducts(),
  ]);

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-[462px] rounded-lg border border-[#EDEDED] bg-white p-5">
        <h3 className="font-openSans text-lg font-semibold text-[#2A2A2A]">
          Evolución de Ingresos
        </h3>
        <div className="mt-3 h-[370px]">
          <RevenueLineChart data={chartData} />
        </div>
      </div>

      <div className="h-[462px] rounded-lg border border-[#EDEDED] bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-[20px] w-[20px] text-[#F59E0B]" />
          <h3 className="font-openSans text-lg font-semibold text-[#2A2A2A]">
            Productos Más Vendidos
          </h3>
        </div>

        <div className="space-y-3">
          {topProducts.length === 0 ? (
            <div className="rounded-lg border border-[#F0F0F0] px-4 py-6 text-center font-openSans text-sm text-[#878787]">
              Aún no hay ventas suficientes para mostrar ranking.
            </div>
          ) : (
            topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex h-[65px] items-center gap-4 rounded-lg border border-[#F0F0F0] px-3"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full font-manrope text-sm font-bold ${rankStyles[index] || rankStyles[4]}`}
                >
                  #{index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-openSans text-sm font-semibold text-[#2A2A2A]">
                    {product.name}
                  </p>
                  <p className="truncate font-openSans text-xs font-normal text-[#878787]">
                    {product.category}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-inter text-sm font-semibold text-[#2A2A2A]">
                    {product.amount}
                  </p>
                  <p className="font-openSans text-xs font-normal text-[#878787]">
                    {product.sales}
                  </p>
                </div>

                <div className="rounded-full bg-[#F5FFFA] px-2 py-1 font-manrope text-[11px] font-bold text-[#50CD89]">
                  {product.growth}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
