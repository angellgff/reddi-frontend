"use client";

import { useMemo, useState } from "react";
import { useNotifications } from "@/src/lib/notifications/NotificationsContext";
import { toUINotification } from "@/src/lib/notifications/adapters";
import BellIcon from "@/src/components/icons/BellIcon";
import type { Tables } from "@/src/lib/database.types";

type FilterKey = "all" | "orders" | "payments";

function getCategory(row: Tables<"notifications">): FilterKey | "other" {
  const meta = (row.metadata || {}) as any;
  const tokens = [row.type, meta?.type, meta?.category]
    .map((v) => String(v || "").toLowerCase())
    .filter(Boolean);

  const ordersTypes = new Set([
    "order_status_update",
    "new_offer",
    "order",
    "orders",
    "pedido",
    "pedidos",
  ]);
  const paymentTypes = new Set([
    "payment",
    "payments",
    "payment_received",
    "payout",
    "transfer",
    "pago",
    "pagos",
  ]);

  for (const t of tokens) {
    if (ordersTypes.has(t)) return "orders";
    if (paymentTypes.has(t)) return "payments";
  }
  return "other";
}

export default function RestaurantNotificationsPage() {
  const { notifications, unreadCount, loading, error, markAllAsRead } =
    useNotifications();
  const [filter, setFilter] = useState<FilterKey>("all");

  const ui = useMemo(() => {
    const pairs = notifications.map((row) => ({
      ui: toUINotification(row),
      cat: getCategory(row),
    }));
    return pairs
      .filter((p) => (filter === "all" ? true : p.cat === filter))
      .map((p) => p.ui);
  }, [notifications, filter]);

  return (
    <div className="w-full flex justify-center bg-[rgba(240,242,245,0.72)]">
      {/* Container */}
      <div className="w-full max-w-[1217px] min-h-[690px] flex flex-col items-center">
        {/* Content */}
        <div className="w-full px-[50px] py-[30px] flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[#171717] text-2xl font-poppins font-semibold">
              Notificaciones
            </h2>
            <div className="flex items-center justify-center">
              <button
                onClick={markAllAsRead}
                className="mx-auto inline-flex items-center gap-2 rounded-[12px] bg-[#04BD88] px-5 py-[10px] text-white font-poppins text-sm"
              >
                Marcar todas como leídas
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-end gap-3 h-9">
            {(
              [
                { key: "all", label: "Todos" },
                { key: "orders", label: "Pedidos" },
                { key: "payments", label: "Pagos" },
              ] as { key: FilterKey; label: string }[]
            ).map(({ key, label }) => {
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={
                    "inline-flex h-9 w-[144px] items-center justify-center rounded-[28px] px-[10px] text-sm font-poppins transition-colors border " +
                    (isActive
                      ? "bg-[#CDF7E7] border-[#04BD88] text-[#04BD88]"
                      : "bg-[rgba(240,242,245,0.72)] border-[#D9DCE3] text-black")
                  }
                  aria-pressed={isActive}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <section className="w-full bg-white rounded-[20px] p-[20px]">
            {loading && <p className="text-sm text-gray-500">Cargando…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && ui.length === 0 && (
              <p className="text-sm text-gray-600">No tienes notificaciones.</p>
            )}

            <div className="divide-y divide-[#D9DCE3]">
              {ui.map((n) => (
                <article key={n.id} className="flex gap-3 py-4">
                  <div className="h-6 w-6 rounded-md bg-[#E8FFF7] flex items-center justify-center">
                    {/* Simple color hint by type */}
                    <svg
                      width="16"
                      height="20"
                      viewBox="0 0 16 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.92024 2C6.81567 2 5.92024 2.89543 5.92024 4V5H9.92024V4C9.92024 2.89543 9.02481 2 7.92024 2ZM11.9202 5V4C11.9202 1.79086 10.1294 0 7.92024 0C5.7111 0 3.92024 1.79086 3.92024 4V5H1.92024C1.3977 5 0.963264 5.40231 0.923187 5.9233L0.00600969 17.8466C-0.0833432 19.0082 0.835097 20 2.00012 20H13.8404C15.0054 20 15.9238 19.0082 15.8345 17.8466L14.9173 5.9233C14.8772 5.40231 14.4428 5 13.9202 5H11.9202ZM9.92024 7V8C9.92024 8.55228 10.368 9 10.9202 9C11.4725 9 11.9202 8.55228 11.9202 8V7H12.9942L13.8404 18H2.00012L2.84627 7H3.92024V8C3.92024 8.55228 4.36796 9 4.92024 9C5.47253 9 5.92024 8.55228 5.92024 8V7H9.92024Z"
                        fill="#04BD88"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-[#04BD88] font-poppins font-bold text-base">
                        {n.title}
                      </h3>
                      <span className="ml-auto text-sm text-[#6A6C71]">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[#000] text-base">{n.description}</p>
                  </div>
                </article>
              ))}
            </div>

            {ui.length > 0 && (
              <div className="mt-4 border border-[#D9DCE3] rounded-[16px]">
                <button className="w-full text-center py-2 text-[#6A6C71] text-sm">
                  Ver más
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
