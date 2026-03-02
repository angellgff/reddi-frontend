import { Suspense } from "react";
import MarketOrdersSkeleton from "@/src/components/features/partner/market/orders_market/main/MarketOrdersSkeleton";
import MarketOrdersServer from "@/src/components/features/partner/market/orders_market/main/MarketOrdersServer";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, cursor } = await searchParams;

  return (
    <div className="min-h-screen bg-[#F9F9F9] px-8 pt-6">
      <section>
        <Suspense fallback={<MarketOrdersSkeleton />}>
          <MarketOrdersServer category={category} cursor={cursor} />
        </Suspense>
      </section>
    </div>
  );
}
