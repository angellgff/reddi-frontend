import StatusChip from "@/src/components/basics/StatusChip";

export type HistoryRow = {
  id: string;
  date: string; // e.g. "15 Ene, 10:30"
  customer: string; // e.g. "$85.000"
  total: string; // e.g. "$12.750"
  status: "Pendiente" | "Entregado" | "Cancelado";
};

const mockRows: HistoryRow[] = [
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    customer: "$85.000",
    total: "$12.750",
    status: "Pendiente",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    customer: "$85.000",
    total: "$12.750",
    status: "Pendiente",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    customer: "$85.000",
    total: "$12.750",
    status: "Entregado",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    customer: "$85.000",
    total: "$12.750",
    status: "Cancelado",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    customer: "$85.000",
    total: "$12.750",
    status: "Pendiente",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    customer: "$85.000",
    total: "$12.750",
    status: "Cancelado",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    customer: "$85.000",
    total: "$12.750",
    status: "Entregado",
  },
  {
    id: "#12345",
    date: "15 Ene, 10:30",
    customer: "$85.000",
    total: "$12.750",
    status: "Pendiente",
  },
];

type Filters = { from?: string; to?: string; status?: string };

export default function HistoryView({
  rows = mockRows,
  page = 1,
  totalPages = 1,
  filters,
}: {
  rows?: HistoryRow[];
  page?: number;
  totalPages?: number;
  filters?: Filters;
}) {
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-[#171717]">Historial</h1>
      <h2 className="font-roboto text-[18px] leading-6 text-black mb-5">
        Consulta todos tus movimientos y registros anteriores
      </h2>

      {/* Filters */}
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
              <option>Pendiente</option>
              <option>Entregado</option>
              <option>Cancelado</option>
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

      {/* Table */}
      <section className="bg-white rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-3">
          <h3 className="text-[#1F2937] text-lg font-semibold">
            Historial de pedidos
          </h3>
        </div>

        <div className="border border-[#D9DCE3] rounded-2xl overflow-hidden">
          <div className="bg-[#F0F2F5B8] border-b border-[#E7E7E7] grid grid-cols-[1.2fr,1fr,1fr,1fr,1fr,80px] text-[#525252] text-sm">
            <div className="px-3 py-3">Número de Pedido</div>
            <div className="px-3 py-3">Fecha y Hora</div>
            <div className="px-3 py-3">Cliente</div>
            <div className="px-3 py-3">Total</div>
            <div className="px-3 py-3">Estado</div>
            <div className="px-3 py-3">Acciones</div>
          </div>

          <ul className="divide-y">
            {rows.map((r, idx) => (
              <li
                key={`${r.id}-${idx}`}
                className="grid grid-cols-[1.2fr,1fr,1fr,1fr,1fr,80px] items-center text-[#454545] text-sm bg-white"
              >
                <div className="px-3 py-3">{r.id}</div>
                <div className="px-3 py-3">{r.date}</div>
                <div className="px-3 py-3">{r.customer}</div>
                <div className="px-3 py-3">{r.total}</div>
                <div className="px-3 py-3">
                  <StatusChip status={r.status} />
                </div>
                <div className="px-3 py-3 text-right">
                  <span className="w-6 h-6 rounded-lg border border-[#B0B0B0] text-[#454545] grid place-items-center">
                    •
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mt-4">
          <div className="text-sm text-[#737373]">
            The page on {page} / {totalPages}
          </div>
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
