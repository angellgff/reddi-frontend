import { Suspense } from "react";
import StatSectionSkeleton from "@/src/components/features/partner/stats/StatSectionSkeleton";
import StatSectionServer from "@/src/components/features/partner/dashboard/main/MainStatsServer";
import ActiveOrdersServer from "@/src/components/features/partner/dashboard/main/orders/ActiveOrdersServer";
import OrdersSkeleton from "@/src/components/features/partner/dashboard/main/orders/OrdersSkeleton";
import PerformancePanelsServer from "@/src/components/features/partner/dashboard/main/PerformancePanelsServer";

export default function PartnerDashboardPage() {
  return (
    <div className="-mt-[86px] min-h-screen bg-[#F9F9F9] px-8 pb-8 pt-7">
      <h1 className="font-poppins text-2xl font-medium leading-7 text-[#171717]">
        Dashboard
      </h1>
      <h2 className="mb-4 font-openSans text-xl font-semibold text-black">
        Resumen de tu negocio
      </h2>

      <Suspense fallback={<StatSectionSkeleton />}>
        <StatSectionServer />
      </Suspense>

      <div className="space-y-6">
        <PerformancePanelsServer />

        <Suspense fallback={<OrdersSkeleton />}>
          <ActiveOrdersServer />
        </Suspense>
      </div>
    </div>
  );
}
