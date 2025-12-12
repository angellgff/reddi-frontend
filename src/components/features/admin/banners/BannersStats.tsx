import { Monitor, MousePointerClick, Ticket } from "lucide-react";
import StatCard from "@/src/components/features/admin/dashboard/stats/StatCard";
import { BannersStatsData } from "@/src/lib/admin/data/banners/getBannersStats";

export default function BannersStats({ stats }: { stats: BannersStatsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
      <StatCard title="Banners Activos" value={stats.activeBanners.toString()}>
        <div className="p-3 bg-[#00C48C] rounded-full">
          <Monitor className="text-white w-6 h-6" />
        </div>
      </StatCard>
      <StatCard title="Clics Totales" value={stats.totalClicks.toString()}>
        <div className="p-3 bg-[#00C48C] rounded-full">
          <MousePointerClick className="text-white w-6 h-6" />
        </div>
      </StatCard>
      <StatCard title="Descuentos Usados" value={stats.couponsUsed.toString()}>
        <div className="p-3 bg-[#00C48C] rounded-full">
          <Ticket className="text-white w-6 h-6" />
        </div>
      </StatCard>
    </div>
  );
}
