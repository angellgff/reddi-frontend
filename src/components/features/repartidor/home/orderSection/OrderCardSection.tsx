"use client";

import OrderCard from "@/src/components/features/repartidor/home/orderSection/OrderCard";
import { OrderData } from "@/src/lib/repartidor/type";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <>
      <div className="font-bold ml-6 mb-5 text-xl">
        <span className="text-primary">Pedidos</span> <span>Activos</span>
      </div>
      {orders.length === 0 ? (
        <div className="text-center text-sm text-gray-500 px-6">
          No hay pedidos activos por ahora.
        </div>
      ) : (
        <div className="space-y-6">
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
    </>
  );
}
