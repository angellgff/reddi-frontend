import HistoryView from "./HistoryView";
import { getOrdersHistoryData } from "@/src/lib/partner/orders/getOrdersHistoryData";

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
    // 15 ene, 10:30 -> capitalizar mes similar a diseño (Ene)
    const monthCap = day.replace(/(\b[a-z])/g, (m) => m.toUpperCase());
    return `${monthCap}, ${time}`.replace(",", "");
  } catch {
    return "-";
  }
}

function formatMoneyCLP(v: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(v || 0));
}

export default async function HistoryServer({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const { from, to, status, page } = searchParams || {};
  const {
    rows,
    page: currentPage,
    totalPages,
    totalCount,
  } = await getOrdersHistoryData({
    from: Array.isArray(from) ? from[0] : from,
    to: Array.isArray(to) ? to[0] : to,
    status: Array.isArray(status) ? status[0] : status,
    page,
    limit: 10,
  });

  const uiRows = rows.map((r) => {
    const amount = Number(r.total_amount || 0);
    const commission = Math.max(0, Number(r.platform_profit || 0));
    const profit = Math.max(0, amount - commission);

    return {
      id: `#${String(r.id).slice(0, 6)}`,
      date: formatDate(r.created_at),
      amount: formatMoneyCLP(amount),
      fee: formatMoneyCLP(commission),
      profit: formatMoneyCLP(profit),
      status: ((): "Pagado" | "Pendiente" => {
        const s = (r.status || "").toLowerCase();
        if (s === "delivered") return "Pagado";
        return "Pendiente";
      })(),
    };
  });

  return (
    <HistoryView
      rows={uiRows}
      page={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      filters={{
        from: Array.isArray(from) ? from[0] : from,
        to: Array.isArray(to) ? to[0] : to,
        status: Array.isArray(status) ? status[0] : status,
      }}
    />
  );
}
