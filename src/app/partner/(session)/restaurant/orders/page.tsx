import { Suspense } from "react";
import OrdersSkeleton from "@/src/components/features/partner/market/orders/main/OrdersSkeleton";
import OrdersServer from "@/src/components/features/partner/market/orders/main/OrdersServer";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, cursor } = await searchParams;

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <h1 className="font-semibold">Lista de pedidos</h1>
      <h2 className="font-roboto font-normal mb-5">
        Gestiona todos los pedidos de tu negocio
      </h2>

      {/* Fila 1: Lista de órdenes */}
      <section className="bg-white px-10 py-6 rounded-xl">
        <Suspense fallback={<OrdersSkeleton />}>
          <OrdersServer category={category} cursor={cursor} />
        </Suspense>
      </section>
    </div>
  );
}
