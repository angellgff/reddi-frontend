import HistoryView, { HistoryRow } from "./HistoryView";
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
  } = await getOrdersHistoryData({
    from: Array.isArray(from) ? from[0] : from,
    to: Array.isArray(to) ? to[0] : to,
    status: Array.isArray(status) ? status[0] : status,
    page,
    limit: 10,
  });

  // Obtener nombres de perfil de usuarios implicados
  // Hacemos el join en una segunda consulta aquí por simplicidad
  const userIds = Array.from(
    new Set(rows.map((r) => r.user_id).filter(Boolean))
  ) as string[];
  const names = new Map<string, string>();
  if (userIds.length) {
    const { createClient } = await import("@/src/lib/supabase/server");
    const supabase = await createClient();
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", userIds);
    (profs ?? []).forEach((p: any) => {
      const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
      const fromEmail = p.email?.split("@")[0];
      names.set(p.id, full || fromEmail || "Cliente");
    });
  }

  const uiRows: HistoryRow[] = rows.map((r) => ({
    id: `#${String(r.id).slice(0, 6)}`,
    date: formatDate(r.created_at),
    customer: r.user_id ? names.get(r.user_id) || "Cliente" : "Cliente",
    total: formatMoneyCLP(r.total_amount),
    status: ((): HistoryRow["status"] => {
      const s = (r.status || "").toLowerCase();
      if (s === "delivered") return "Entregado";
      if (s === "canceled") return "Cancelado";
      return "Pendiente"; // confirmed, new, pending, preparing, on_the_way
    })(),
  }));

  return (
    <HistoryView
      rows={uiRows}
      page={currentPage}
      totalPages={totalPages}
      filters={{
        from: Array.isArray(from) ? from[0] : from,
        to: Array.isArray(to) ? to[0] : to,
        status: Array.isArray(status) ? status[0] : status,
      }}
    />
  );
}
