"use client";

import OrderCard from "@/src/components/features/repartidor/home/orderSection/OrderCard";
import { OrderData } from "@/src/lib/repartidor/type";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { acceptDeliveryOrderAction } from "@/src/lib/actions/delivery";

export default function OrderCardSection({ orders }: { orders: OrderData[] }) {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const refreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const queueRefresh = () => {
      if (document.hidden) return;
      if (pathname !== "/repartidor/home") return;

      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current);
      }

      refreshDebounceRef.current = setTimeout(() => {
        startTransition(() => {
          router.refresh();
        });
      }, 350);
    };

    const intervalId = window.setInterval(() => {
      queueRefresh();
    }, 3000);

    const onVisibilityChange = () => {
      if (!document.hidden) queueRefresh();
    };

    const onWindowFocus = () => {
      queueRefresh();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onWindowFocus);

    return () => {
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current);
        refreshDebounceRef.current = null;
      }

      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [pathname, router]);

  const requestAccept = async () => {
    if (!pendingAcceptId) return;
    try {
      setLoading(true);
      const result = await acceptDeliveryOrderAction(pendingAcceptId);
      if (result.success) {
        // Refresh server component data
        router.refresh();
      } else {
        console.error("Error accepting delivery order:", result.error);
      }
    } finally {
      setLoading(false);
      setPendingAcceptId(null);
    }
  };

  const activeOrders = orders.filter((order) => order.status !== "Completado");
  const completedOrders = orders.filter(
    (order) => order.status === "Completado",
  );
  const visibleOrders = tab === "active" ? activeOrders : completedOrders;

  return (
    <div className="mx-auto w-full max-w-[390px] pb-20">
      <div className="px-4 pb-2 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="font-openSans text-[32px] font-bold leading-none text-black">
            Pedidos activos
          </h1>
          <div className="flex items-center gap-3 text-black">
            <Link
              href="/repartidor/historial"
              aria-label="Historial"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <svg
                width="15"
                height="19"
                viewBox="0 0 15 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 0V18.333L4.583 15.833L7.5 18.333L10.417 15.833L15 18.333V0H0ZM11.667 6.667H3.333V4.167H11.667V6.667Z"
                  fill="black"
                />
              </svg>
            </Link>
            <Link
              href="/repartidor/profile"
              aria-label="Perfil"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 11C12.2091 11 14 9.20914 14 7C14 4.79086 12.2091 3 10 3C7.79086 3 6 4.79086 6 7C6 9.20914 7.79086 11 10 11ZM10 13C6.68629 13 4 15.6863 4 19C4 19.5523 4.44772 20 5 20H15C15.5523 20 16 19.5523 16 19C16 15.6863 13.3137 13 10 13Z"
                  fill="black"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DCDCDC] px-4 pt-3">
        <div className="mb-6 rounded-full bg-[#F4F5F7] p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setTab("active")}
              className={`h-9 rounded-full text-[15px] font-bold transition-colors ${
                tab === "active"
                  ? "bg-black text-white"
                  : "bg-transparent text-black"
              }`}
            >
              Activos ({activeOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("completed")}
              className={`h-9 rounded-full text-[15px] font-semibold transition-colors ${
                tab === "completed"
                  ? "bg-black text-white"
                  : "bg-transparent text-black"
              }`}
            >
              Completados ({completedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="px-6 pt-6 text-center text-sm text-gray-500">
          {tab === "active"
            ? "No hay pedidos activos por ahora."
            : "No hay pedidos completados por ahora."}
        </div>
      ) : (
        <div className="space-y-2 px-4 pb-20">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.orderId}
              {...order}
              onAccept={(id) => setPendingAcceptId(id)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={pendingAcceptId !== null}
        title="¿Aceptar este pedido?"
        description="Te asignarás como repartidor del pedido seleccionado."
        confirmText={loading ? "Asignando..." : "Sí, aceptar"}
        cancelText="Cancelar"
        loading={loading}
        onCancel={() => (loading ? null : setPendingAcceptId(null))}
        onConfirm={requestAccept}
      />
    </div>
  );
}
