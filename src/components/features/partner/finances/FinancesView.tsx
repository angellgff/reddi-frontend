import StatCard from "@/src/components/features/partner/stats/StatCard";
import StatDollarIcon from "@/src/components/icons/StatDollarIcon";
import CompleteOrderIcon from "@/src/components/icons/CompleteOrderIcon";
import React from "react";

// Tipos para la tabla
export type FinanceRow = {
  id: string; // N° Pedido
  date: string; // "15 Ene, 10:30"
  amount: string; // Monto
  fee: string; // Comisión
  profit: string; // Ganancia
  status: "Pagado" | "Pendiente";
};

// Mock básico para empezar la vista
const mockRows: FinanceRow[] = [
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    amount: "$85.000",
    fee: "$12.750",
    profit: "$72.250",
    status: "Pagado",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    amount: "$85.000",
    fee: "$12.750",
    profit: "$72.250",
    status: "Pendiente",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    amount: "$85.000",
    fee: "$12.750",
    profit: "$72.250",
    status: "Pagado",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    amount: "$85.000",
    fee: "$12.750",
    profit: "$72.250",
    status: "Pendiente",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    amount: "$85.000",
    fee: "$12.750",
    profit: "$72.250",
    status: "Pagado",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    amount: "$85.000",
    fee: "$12.750",
    profit: "$72.250",
    status: "Pendiente",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    amount: "$85.000",
    fee: "$12.750",
    profit: "$72.250",
    status: "Pagado",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    amount: "$85.000",
    fee: "$12.750",
    profit: "$72.250",
    status: "Pendiente",
  },
];

export type FinanceFilters = { from?: string; to?: string; status?: string };

function PaymentStatusChip({ status }: { status: "Pagado" | "Pendiente" }) {
  const style =
    status === "Pagado"
      ? { className: "bg-[#D7FFD8] text-[#04910C]", label: "Pagado" }
      : { className: "bg-[#FFF5C5] text-[#E27D00]", label: "Pendiente" };

  return (
    <span
      className={`inline-flex items-center rounded-[10px] px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export default function FinancesView({
  rows = mockRows,
  filters,
  page = 1,
  totalPages = 13,
  stats = {
    todayIncome: "$350.4",
    bestSellers: "$642.39",
    monthIncome: "$642.39",
    ordersCompleted: "2935",
    commissions: "2935",
  },
}: {
  rows?: FinanceRow[];
  filters?: FinanceFilters;
  page?: number;
  totalPages?: number;
  stats?: {
    todayIncome: string;
    bestSellers: string;
    monthIncome: string;
    ordersCompleted: string;
    commissions: string;
  };
}) {
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-[#171717]">
          Ventas y Finanzas
        </h1>
        <p className="font-roboto text-[18px] leading-6 text-black">
          Gestiona tus ingresos, retiros y análisis financieros
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2 mb-5">
        <StatCard title="Ingreso de Hoy" value={stats.todayIncome}>
          <StatDollarIcon />
        </StatCard>
        <StatCard title="Más Vendidos" value={stats.bestSellers}>
          <CompleteOrderIcon />
        </StatCard>
        <StatCard title="Ingresos del Mes" value={stats.monthIncome}>
          <StatDollarIcon />
        </StatCard>
        <StatCard title="Pedidos completados" value={stats.ordersCompleted}>
          <CompleteOrderIcon />
        </StatCard>
        <StatCard title="Comisiones" value={stats.commissions}>
          <StatDollarIcon />
        </StatCard>
      </div>

      {/* Filtros */}
      <section className="bg-white rounded-2xl p-5 mb-6">
        <h3 className="text-[#1F2937] text-lg font-semibold mb-4">Filtros</h3>
        <form
          className="flex flex-col md:flex-row md:items-end gap-5"
          method="get"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#292929] mb-2">
              Desde
            </label>
            <input
              type="date"
              name="from"
              defaultValue={filters?.from}
              className="w-full h-10 border border-[#D9DCE3] rounded-xl px-4 text-sm"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-[#292929] mb-2">
              Hasta
            </label>
            <input
              type="date"
              name="to"
              defaultValue={filters?.to}
              className="w-full h-10 border border-[#D9DCE3] rounded-xl px-4 text-sm"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-[#292929] mb-2">
              Estados
            </label>
            <select
              name="status"
              defaultValue={filters?.status || ""}
              className="w-full h-10 border border-[#D9DCE3] rounded-xl px-4 text-sm bg-white"
            >
              <option value="">Seleccione</option>
              <option>Pagado</option>
              <option>Pendiente</option>
            </select>
          </div>

          <div className="flex gap-3 whitespace-nowrap">
            <a
              href="?"
              className="h-11 px-5 rounded-xl border border-[#202124] bg-white text-[#202124] text-sm grid place-items-center"
            >
              Limpiar filtros
            </a>
            <button
              className="h-11 px-5 rounded-xl bg-[#04BD88] text-white text-sm"
              type="submit"
            >
              Filtrar
            </button>
          </div>
        </form>
      </section>

      {/* Tabla */}
      <section className="bg-white rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-[#1F2937] text-lg font-semibold">
            Historial de Ventas
          </h3>
        </div>

        <div className="border border-[#D9DCE3] rounded-2xl overflow-hidden">
          {/* ---- INICIO DE LA CORRECCIÓN: Cabecera ---- */}
          <div className="bg-[#F0F2F5B8] border-b border-[#E7E7E7] grid grid-cols-[1.2fr,1fr,1fr,1fr,1fr,1fr] text-[#525252] text-sm">
            <div className="px-3 py-3">Pedido</div>
            <div className="px-3 py-3">Fecha</div>
            <div className="px-3 py-3">Monto</div>
            <div className="px-3 py-3">Comisión</div>
            <div className="px-3 py-3">Ganancia</div>
            <div className="px-3 py-3">Estado</div>
          </div>

          <ul className="divide-y">
            {rows.map((r, idx) => (
              // ---- INICIO DE LA CORRECCIÓN: Fila de datos ----
              <li
                key={`${r.id}-${idx}`}
                className="grid grid-cols-[1.2fr,1fr,1fr,1fr,1fr,1fr] items-center text-[#454545] text-sm bg-white"
              >
                <div className="px-3 py-3">{r.id}</div>
                <div className="px-3 py-3">{r.date}</div>
                <div className="px-3 py-3">{r.amount}</div>
                <div className="px-3 py-3">{r.fee}</div>
                <div className="px-3 py-3">{r.profit}</div>
                <div className="px-3 py-3">
                  <PaymentStatusChip status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Paginación */}
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mt-4">
          <div className="text-sm text-[#737373]">1 - 10 of 13 Pages</div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <a
                className={`border border-[#B0B0B0] rounded-lg w-8 h-7 grid place-items-center ${
                  page <= 1 ? "opacity-40 pointer-events-none" : ""
                }`}
                href={`?${new URLSearchParams({
                  ...(filters?.from ? { from: filters.from } : {}),
                  ...(filters?.to ? { to: filters.to } : {}),
                  ...(filters?.status ? { status: filters.status } : {}),
                  page: String(Math.max(1, page - 1)),
                }).toString()}`}
              >
                {"<"}
              </a>
              <a
                className={`border border-[#B0B0B0] rounded-lg w-8 h-7 grid place-items-center ${
                  page >= totalPages ? "opacity-40 pointer-events-none" : ""
                }`}
                href={`?${new URLSearchParams({
                  ...(filters?.from ? { from: filters.from } : {}),
                  ...(filters?.to ? { to: filters.to } : {}),
                  ...(filters?.status ? { status: filters.status } : {}),
                  page: String(Math.min(totalPages, page + 1)),
                }).toString()}`}
              >
                {">"}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
