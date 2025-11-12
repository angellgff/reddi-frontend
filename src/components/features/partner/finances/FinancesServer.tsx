import FinancesView from "./FinancesView";
import { getFinancesData } from "@/src/lib/partner/finances/getFinancesData";

function formatMoneyCLP(v: number) {
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(v || 0));
  } catch {
    return `$${Number(v || 0).toFixed(0)}`;
  }
}

function formatDate(dateIso: string) {
  try {
    const d = new Date(dateIso);
    const day = d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
    const time = d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const monthCap = day.replace(/(\b[a-z])/g, (m) => m.toUpperCase());
    return `${monthCap}, ${time}`.replace(",", "");
  } catch {
    return "-";
  }
}

export default async function FinancesServer({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const { from, to, status, page } = searchParams || {};
  const {
    rows,
    page: currentPage,
    totalPages,
    stats,
  } = await getFinancesData({
    from: Array.isArray(from) ? from[0] : from,
    to: Array.isArray(to) ? to[0] : to,
    status: Array.isArray(status) ? status[0] : status,
    page,
    limit: 10,
  });

  const uiRows = rows.map((r) => {
    const isDelivered = (r.status || "").toLowerCase() === "delivered";
    const commission = r.shipping_fee || 0; // aproximación
    const profit = Math.max(0, (r.total_amount || 0) - commission);
    return {
      id: `#${String(r.id).slice(0, 6)}`,
      date: formatDate(r.created_at),
      amount: formatMoneyCLP(r.total_amount),
      fee: formatMoneyCLP(commission),
      profit: formatMoneyCLP(profit),
      status: isDelivered ? "Pagado" : "Pendiente",
    } as const;
  });

  return (
    <FinancesView
      rows={uiRows}
      page={currentPage}
      totalPages={totalPages}
      filters={{
        from: Array.isArray(from) ? from[0] : from,
        to: Array.isArray(to) ? to[0] : to,
        status: Array.isArray(status) ? status[0] : status,
      }}
      stats={{
        todayIncome: formatMoneyCLP(stats.todayIncome),
        bestSellers: formatMoneyCLP(stats.weekIncome), // placeholder semanales
        monthIncome: formatMoneyCLP(stats.monthIncome),
        ordersCompleted: String(stats.ordersCompleted),
        commissions: formatMoneyCLP(stats.commissions),
      }}
    />
  );
}
