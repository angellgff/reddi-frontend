"use client";

import type { OrderListItem } from "@/src/lib/admin/data/orders/getOrders";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function formatMoney(n: number) {
  try {
    // COP-like formatting
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return `$${(n || 0).toFixed(2)}`;
  }
}

const chipStyles: Record<string, { bg: string; text: string; label: string }> =
  {
    delivered: {
      bg: "bg-[#D7FFD8]",
      text: "text-[#04910C]",
      label: "Entregado",
    },
    out_for_delivery: {
      bg: "bg-[#DCD2FF]",
      text: "text-[#7F27FF]",
      label: "En camino",
    },
    preparing: {
      bg: "bg-[#D9EDFF]",
      text: "text-[#1A71F6]",
      label: "En preparación",
    },
    pending: { bg: "bg-[#FFF5C5]", text: "text-[#E27D00]", label: "Pendiente" },
    cancelled: {
      bg: "bg-[#FFDCDC]",
      text: "text-[#FF0000]",
      label: "Cancelado",
    },
  };

function StatusChip({ status }: { status: string }) {
  const s = chipStyles[status] || chipStyles["pending"];
  return (
    <span
      className={`inline-flex items-center rounded-[10px] px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

interface OrdersTableClientProps {
  orders: OrderListItem[];
  page: number;
  total: number;
  pageSize: number;
}

export default function OrdersTableClient({
  orders,
  page,
  total,
  pageSize,
}: OrdersTableClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", targetPage.toString());
    }
    return `${pathname}?${params.toString()}`;
  };
  return (
    <div className="w-full">
      <div className="rounded-t-2xl border border-[#E7E7E7] bg-[#F0F2F5]/70">
        <div className="grid grid-cols-7 text-[14px] text-[#525252]">
          <div className="px-3 py-3">Pedido</div>
          <div className="px-3 py-3">Cliente</div>
          <div className="px-3 py-3">Aliado</div>
          <div className="px-3 py-3">Repartidor</div>
          <div className="px-3 py-3">Fecha/Hora</div>
          <div className="px-3 py-3">Total</div>
          <div className="px-3 py-3">Estado</div>
        </div>
      </div>
      <div className="border-x border-b border-[#D9DCE3] rounded-b-2xl divide-y">
        {orders.map((o) => {
          const date = new Date(o.created_at);
          const day = date.toLocaleDateString("es-CO");
          const time = date.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={o.id}
              className="grid grid-cols-7 bg-white hover:bg-gray-50 text-[14px]"
            >
              <div className="px-3 py-4 text-[#454545]">
                #{o.id.slice(0, 6)}
              </div>
              <div className="px-3 py-4">
                <div className="text-[#454545] truncate">
                  {o.customerName || "—"}
                </div>
                <div className="text-[#737373] text-xs">—</div>
              </div>
              <div className="px-3 py-4 text-[#454545]">
                {o.partnerName || "—"}
              </div>
              <div className="px-3 py-4 text-[#454545]">—</div>
              <div className="px-3 py-4">
                <div className="text-[#171717]">{day}</div>
                <div className="text-[#737373] text-xs">{time}</div>
              </div>
              <div className="px-3 py-4 text-[#454545]">
                {formatMoney(o.total_amount)}
              </div>
              <div className="px-3 py-4">
                <StatusChip
                  status={(o.status as unknown as string) || "pending"}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación funcional conservando estilos originales */}
      <div className="mt-4 flex items-center justify-between text-sm text-[#737373]">
        <div className="mx-auto">
          {start} - {end} de {total} registros
        </div>
        <div className="mx-auto flex items-center gap-2">
          <span className="text-[#454545]">The page on</span>
          <div className="flex items-center gap-1 rounded-lg border border-[#B0B0B0] px-2 h-7">
            <span>{page}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 10l5 5 5-5"
                stroke="#454545"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={buildPageHref(page - 1)}
              aria-label="Prev"
              className={`h-7 w-8 rounded-lg border border-[#B0B0B0] grid place-items-center ${
                page === 1
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-gray-100"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke={page === 1 ? "#888" : "#888"}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </Link>
            <Link
              href={buildPageHref(page + 1)}
              aria-label="Next"
              className={`h-7 w-8 rounded-lg border border-[#B0B0B0] grid place-items-center ${
                page >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-gray-100"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="#454545"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
