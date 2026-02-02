import getHistoryOrders from "@/src/lib/repartidor/history/getHistoryOrders";
import HistoryCard from "@/src/components/features/repartidor/history/HistoryCard";
import AvailabilityStatus from "@/src/components/features/repartidor/history/AvailabilityStatus";
import HistoryHeader from "@/src/components/features/repartidor/history/HistoryHeader";
import { getDriverStatus } from "@/src/lib/actions/repartidor/getDriverStatus";
import { Suspense } from "react";

export const revalidate = 30;

async function HistoryContent() {
  const [items, statusData] = await Promise.all([
    getHistoryOrders(),
    getDriverStatus(),
  ]);

  return (
    <div className="flex flex-col bg-[#ECEFF0] min-h-screen pb-20">
      <HistoryHeader />

      <div className="flex flex-col items-center px-4 pt-6 gap-6 w-full">
        {/* Availability Status Section */}
        <AvailabilityStatus initialStatus={statusData.status} />

        {/* History Header */}
        <h2 className="text-[20px] font-bold text-[#595959] font-openSans w-full max-w-[352px]">
          Historial Reciente
        </h2>

        {/* History List */}
        <div className="flex flex-col gap-4 w-full max-w-[352px]">
          {items.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-10">
              No hay pedidos entregados todavía.
            </div>
          )}
          {items.map((it) => (
            <HistoryCard key={it.orderId} item={it} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HistorialPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-sm text-center">Cargando...</div>}
    >
      <HistoryContent />
    </Suspense>
  );
}
