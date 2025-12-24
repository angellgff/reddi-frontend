"use server";

import StatCardSection from "@/src/components/features/partner/stats/StatCardSection";
import getStatsData from "@/src/lib/partner/dashboard/data/main/getMainStatsData";
import StatCarIcon from "@/src/components/icons/StatCarIcon";
import StatDollarIcon from "@/src/components/icons/StatDollarIcon";
import CompleteOrderIcon from "@/src/components/icons/CompleteOrderIcon";
import ActiveProductIcon from "@/src/components/icons/ActiveProductIcon";
import FinancesIcon from "@/src/components/icons/FinancesIcon";
import type { MainStatsData } from "@/src/lib/partner/dashboard/type";

// Mapa de Iconos
const iconMap: Record<MainStatsData["statKey"], React.ReactNode> = {
  active_orders: <StatCarIcon fill="white" />,
  today_earnings: <StatDollarIcon fill="white" />,
  delivered_orders: <CompleteOrderIcon fill="white" />,
  active_products: <ActiveProductIcon fill="white" />,
  commissions: <FinancesIcon fill="white" />,
};

// Mapa de Títulos
const titleMap: Record<MainStatsData["statKey"], string> = {
  active_orders: "Pedidos activos",
  today_earnings: "Ingresos de hoy",
  delivered_orders: "Pedidos completados",
  active_products: "Productos activos",
  commissions: "Comisión / Margen",
};

export default async function MainStatsServer() {
  const statsData = await getStatsData();
  return (
    <StatCardSection
      stats={statsData}
      iconMap={iconMap}
      titleMap={titleMap}
      getKey={(item) => item.statKey}
      getValue={(item) => item.value}
    />
  );
}
