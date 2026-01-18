import { Suspense } from "react";
import ClientOrderHeaderServer from "@/src/components/features/admin/customers/orders/ClientOrderHeaderServer";
import ClientOrderTrackingServer from "@/src/components/features/admin/customers/orders/ClientOrderTrackingServer";
import ClientOrderDetailsServer from "@/src/components/features/admin/customers/orders/ClientOrderDetailsServer";
import MarketOrderTrackingSkeleton from "@/src/components/features/partner/market/orders_market/order/MarketOrderTrackingSkeleton";
import MarketOrderDetailsSkeleton from "@/src/components/features/partner/market/orders_market/order/MarketOrderDetailsSkeleton";

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <Suspense fallback={<div></div>}>
        <ClientOrderHeaderServer id={orderId} />
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl cols-span-1 shadow-md border-2 border-gray-300 p-6">
            <Suspense fallback={<MarketOrderTrackingSkeleton />}>
              <ClientOrderTrackingServer id={orderId} />
            </Suspense>
          </div>
          <div className="bg-white rounded-xl cols-span-1 shadow-md border-2 border-gray-300 p-6">
            <Suspense fallback={<MarketOrderDetailsSkeleton />}>
              <ClientOrderDetailsServer id={orderId} />
            </Suspense>
          </div>
        </section>
      </Suspense>
    </div>
  );
}
