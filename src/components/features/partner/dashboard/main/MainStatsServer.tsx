"use server";

import StatCardSection from "@/src/components/features/partner/stats/StatCardSection";
import getStatsData from "@/src/lib/partner/dashboard/data/main/getMainStatsData";
import FinancesIcon from "@/src/components/icons/FinancesIcon";
import type { MainStatsData } from "@/src/lib/partner/dashboard/type";
import Image from "next/image";

// Mapa de Iconos
const iconMap: Record<MainStatsData["statKey"], React.ReactNode> = {
  active_orders: (
    <Image
      src="/new-design/svg/partners/nd-active-orders.svg"
      alt="Pedidos activos"
      width={18}
      height={18}
    />
  ),
  today_earnings: (
    <Image
      src="/new-design/svg/partners/nd-incomes.svg"
      alt="Ingresos"
      width={18}
      height={18}
    />
  ),
  delivered_orders: (
    <Image
      src="/new-design/svg/partners/nd-complete-orders.svg"
      alt="Pedidos completados"
      width={18}
      height={18}
    />
  ),
  active_products: (
    <Image
      src="/new-design/svg/partners/nd-products.svg"
      alt="Productos activos"
      width={18}
      height={18}
    />
  ),
  commissions: <FinancesIcon fill="#595959" />,
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
  const prioritizedOrder: MainStatsData["statKey"][] = [
    "delivered_orders",
    "today_earnings",
    "active_products",
    "commissions",
    "active_orders",
  ];

  const mainStats = statsData
    .filter((item) => prioritizedOrder.includes(item.statKey))
    .sort(
      (a, b) =>
        prioritizedOrder.indexOf(a.statKey) -
        prioritizedOrder.indexOf(b.statKey),
    );

  return (
    <StatCardSection
      stats={mainStats}
      iconMap={iconMap}
      titleMap={titleMap}
      getKey={(item) => item.statKey}
      getValue={(item) => item.value}
      getTrend={(item) => item.trendPercentage}
    />
  );
}
