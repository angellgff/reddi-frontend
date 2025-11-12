import { Suspense } from "react";
import MarketOrderHeaderServer from "@/src/components/features/partner/market/orders_market/order/MarketOrderHeaderServer";
import MarketOrderTrackingServer from "@/src/components/features/partner/market/orders_market/order/MarketOrderTrackingServer";
import MarketOrderTrackingSkeleton from "@/src/components/features/partner/market/orders_market/order/MarketOrderTrackingSkeleton";
import MarketOrderDetailsServer from "@/src/components/features/partner/market/orders_market/order/MarketOrderDetailsServer";
import MarketOrderDetailsSkeleton from "@/src/components/features/partner/market/orders_market/order/MarketOrderDetailsSkeleton";

export default async function MarketOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <Suspense fallback={<div>Cargando...</div>}>
        <MarketOrderHeaderServer id={id} />
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl cols-span-1 shadow-md border-2 border-gray-300 p-6">
            <Suspense fallback={<MarketOrderTrackingSkeleton />}>
              <MarketOrderTrackingServer id={id} />
            </Suspense>
          </div>
          <div className="bg-white rounded-xl cols-span-1 shadow-md border-2 border-gray-300 p-6">
            <Suspense fallback={<MarketOrderDetailsSkeleton />}>
              <MarketOrderDetailsServer id={id} />
            </Suspense>
          </div>
        </section>
      </Suspense>
    </div>
  );
}
