import { Suspense } from "react";
import OrderHeaderServer from "@/src/components/features/partner/market/orders/order/OrderHeaderServer";
import OrderTrackingServer from "@/src/components/features/partner/market/orders/order/OrderTrackingServer";
import OrderTrackingSkeleton from "@/src/components/features/partner/market/orders/order/OrderTrackingSkeleton";
import OrderDetailsServer from "@/src/components/features/partner/market/orders/order/OrderDetailsServer";
import OrderDetailsSkeleton from "@/src/components/features/partner/market/orders/order/OrderDetailsSkeleton";

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <Suspense fallback={<div>Cargando...</div>}>
        <OrderHeaderServer id={id} />
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1: Datos del cliente */}
          <div className="bg-white rounded-xl cols-span-1 shadow-md border-2 border-gray-300 p-6">
            <Suspense fallback={<OrderTrackingSkeleton />}>
              <OrderTrackingServer id={id} />
            </Suspense>
          </div>
          {/* Columna 2: Detalles del pedido */}
          <div className="bg-white rounded-xl cols-span-1 shadow-md border-2 border-gray-300 p-6">
            <Suspense fallback={<OrderDetailsSkeleton />}>
              <OrderDetailsServer id={id} />
            </Suspense>
          </div>
        </section>
      </Suspense>
    </div>
  );
}
