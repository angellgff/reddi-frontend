"use client";

import { Download } from "lucide-react";

export type SalesHistoryStatus = "Pagado" | "Pendiente";

export type SalesHistoryRow = {
  id: string;
  date: string;
  amount: string;
  fee: string;
  profit: string;
  status: SalesHistoryStatus;
};

type SalesHistoryTableProps = {
  rows: SalesHistoryRow[];
  page: number;
  totalPages: number;
  totalCount: number;
  filters?: {
    from?: string;
    to?: string;
    status?: string;
  };
};

function PaymentStatusChip({ status }: { status: SalesHistoryStatus }) {
  const style =
    status === "Pagado"
      ? "bg-[#D1FAE5] text-[#065F46]"
      : "bg-[#FEF3C7] text-[#92400E]";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

function toCsvValue(value: string) {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}

export default function SalesHistoryTable({
  rows,
  page,
  totalPages,
  totalCount,
  filters,
}: SalesHistoryTableProps) {
  const firstIndex = totalCount === 0 ? 0 : (page - 1) * 10 + 1;
  const lastIndex = Math.min(page * 10, totalCount);

  const createPageHref = (nextPage: number) => {
    const query = new URLSearchParams({
      ...(filters?.from ? { from: filters.from } : {}),
      ...(filters?.to ? { to: filters.to } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      page: String(nextPage),
    });

    return `?${query.toString()}`;
  };

  const prevHref = createPageHref(Math.max(1, page - 1));
  const nextHref = createPageHref(Math.min(totalPages, page + 1));
  const nextNumberHref = createPageHref(page + 1);

  const handleExportCsv = () => {
    const headers = [
      "Pedido",
      "Fecha",
      "Monto",
      "Comisión",
      "Ganancia",
      "Estado",
    ];
    const body = rows.map((row) => [
      row.id,
      row.date,
      row.amount,
      row.fee,
      row.profit,
      row.status,
    ]);

    const csv = [
      headers.map(toCsvValue).join(","),
      ...body.map((line) => line.map((v) => toCsvValue(String(v))).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `historial-ventas-pagina-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.1)]">
      <div className="flex h-[68px] items-center justify-between border-b border-[#E5E7EB] px-5">
        <h2 className="text-[30px] font-bold leading-[26px] tracking-[-0.43px] text-black">
          Historial de Ventas
        </h2>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex h-[36px] items-center gap-2 rounded-[10px] bg-primary px-4 text-[13px] font-medium text-white"
        >
          <Download size={16} />
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-6 bg-[#F9FAFB] text-[13px] font-semibold text-[#6B7280]">
        <div className="px-5 py-3">Pedido</div>
        <div className="px-5 py-3">Fecha</div>
        <div className="px-5 py-3">Monto</div>
        <div className="px-5 py-3">Comisión</div>
        <div className="px-5 py-3">Ganancia</div>
        <div className="px-5 py-3">Estado</div>
      </div>

      <ul>
        {rows.map((row, idx) => (
          <li
            key={`${row.id}-${idx}`}
            className="grid h-[59px] grid-cols-6 items-center border-b border-[#E5E7EB] text-[13px]"
          >
            <div className="px-5 font-medium text-black">{row.id}</div>
            <div className="px-5 text-[#6B7280]">{row.date}</div>
            <div className="px-5 font-semibold text-black">{row.amount}</div>
            <div className="px-5 text-[#6B7280]">{row.fee}</div>
            <div className="px-5 font-semibold text-[#10B981]">
              {row.profit}
            </div>
            <div className="px-5">
              <PaymentStatusChip status={row.status} />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex h-[70px] items-center justify-between border-t border-[#E5E7EB] px-5">
        <p className="text-[13px] text-[#6B7280]">
          {firstIndex} - {lastIndex} de {totalCount} resultados
        </p>

        <div className="flex items-center gap-2">
          <a
            href={prevHref}
            className={`grid h-[38px] min-w-[84px] place-items-center rounded-lg border border-[#D9DCE3] px-3 text-[13px] font-medium text-[#6B7280] ${
              page <= 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Anterior
          </a>

          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-[13px] font-medium text-white">
            {page}
          </span>

          {page < totalPages && (
            <a
              href={nextNumberHref}
              className="grid h-8 w-8 place-items-center rounded-lg border border-[#D9DCE3] text-[13px] font-medium text-[#6B7280]"
            >
              {page + 1}
            </a>
          )}

          <a
            href={nextHref}
            className={`grid h-[38px] min-w-[92px] place-items-center rounded-lg border border-[#D9DCE3] px-3 text-[13px] font-medium text-[#6B7280] ${
              page >= totalPages ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Siguiente
          </a>
        </div>
      </div>
    </section>
  );
}
