"use client";

import OrderCard from "@/src/components/features/repartidor/home/orderSection/OrderCard";
import { OrderData } from "@/src/lib/repartidor/type";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrderCardSection({ orders }: { orders: OrderData[] }) {
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const requestAccept = async () => {
    if (!pendingAcceptId) return;
    try {
      setLoading(true);
      const resp = await fetch("/api/delivery/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: pendingAcceptId }),
      });
      if (resp.ok) {
        // Refresh server component data
        router.refresh();
      }
    } finally {
      setLoading(false);
      setPendingAcceptId(null);
    }
  };

  return (
    <div className="pb-20">
      {/* Header "Delivery" */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold font-openSans">Delivery</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/repartidor/historial"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
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
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
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

      {/* Title "Pedidos Activos" */}
      <div className="mb-5 px-2">
        <h2 className="text-2xl font-bold font-openSans">Pedidos Activos</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center text-sm text-gray-500 px-6 mt-10">
          No hay pedidos activos por ahora.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
