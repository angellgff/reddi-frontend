import OrderSectionServer from "@/src/components/features/repartidor/home/orderSection/OrderSectionServer";
import { Suspense } from "react";
import OrderSectionSkeleton from "@/src/components/features/repartidor/home/orderSection/OrderSectionSkeleton";

export default function HomePage() {
  return (
    <section className="min-h-screen bg-white pb-24">
      <Suspense fallback={<OrderSectionSkeleton />}>
        <OrderSectionServer />
      </Suspense>
    </section>
  );
}
