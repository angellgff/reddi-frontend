"use client";

import OrderCard from "@/src/components/features/repartidor/home/orderSection/OrderCard";
import { OrderData } from "@/src/lib/repartidor/type";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, History } from "lucide-react";

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
            <History className="w-6 h-6 text-black" />
          </Link>
          <Link
            href="/repartidor/profile"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <User className="w-6 h-6 text-black" />
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
