import getHistoryOrders from "@/src/lib/repartidor/history/getHistoryOrders";
import HistoryCard from "@/src/components/features/repartidor/history/HistoryCard";
import { Suspense } from "react";

export const revalidate = 30;

async function HistorySection() {
  const items = await getHistoryOrders();
  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-20 gap-5 bg-[#ECEFF0] min-h-screen">
      <h2 className="text-[18px] font-bold text-primary w-full max-w-[352px]">
        Historial Reciente
      </h2>
      <div className="flex flex-col gap-4 w-full max-w-[352px]">
        {items.length === 0 && (
          <div className="text-sm text-gray-500">
            No hay pedidos entregados todavía.
          </div>
        )}
        {items.map((it) => (
          <HistoryCard key={it.orderId} item={it} />
        ))}
      </div>
    </div>
  );
}

export default function HistorialPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm">Cargando historial...</div>}
    >
      {/* Sección principal */}
      {/* El header global ya viene del layout reutilizado */}
      <HistorySection />
    </Suspense>
  );
}
