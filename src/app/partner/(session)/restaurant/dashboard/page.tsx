import { Suspense } from "react";
import StatSectionSkeleton from "@/src/components/features/partner/stats/StatSectionSkeleton";
import StatSectionServer from "@/src/components/features/partner/dashboard/main/MainStatsServer";
import QuickActions from "@/src/components/features/partner/dashboard/main/QuickActions";
import NotificationsServer from "@/src/components/features/partner/dashboard/main/notifications/NotificationsServer";
import NotificationSkeleton from "@/src/components/features/partner/dashboard/main/notifications/NotificationsSkeleton";
import ActiveOrdersServer from "@/src/components/features/partner/dashboard/main/orders/ActiveOrdersServer";
import OrdersSkeleton from "@/src/components/features/partner/dashboard/main/orders/OrdersSkeleton";

export default function PartnerDashboardPage() {
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <h1 className="font-semibold">Dashboard</h1>
      <h2 className="font-roboto font-normal mb-5">Resumen de tu negocio</h2>
      {/* Fila 1: Tarjetas de Estadísticas */}
      <Suspense fallback={<StatSectionSkeleton />}>
        <StatSectionServer />
      </Suspense>
      {/* Fila 2: Acciones rápidas */}
      <section className="mb-5 flex flex-col justify-between items-center md:flex-row">
        <QuickActions />
      </section>

      {/* Fila 3: Pedidos Activos y Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna de Pedidos Activos (ocupa 2 de 3 columnas en pantallas grandes) */}
        <section className="lg:col-span-1">
          <Suspense fallback={<OrdersSkeleton />}>
            <ActiveOrdersServer />
          </Suspense>
        </section>

        {/* Columna de Notificaciones (ocupa 1 de 3 columnas en pantallas grandes) */}
        <section className="lg:col-span-1">
          <Suspense fallback={<NotificationSkeleton />}>
            <NotificationsServer />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
