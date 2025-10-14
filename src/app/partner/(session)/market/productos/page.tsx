import StatSectionSkeleton from "@/src/components/features/partner/stats/StatSectionSkeleton";
import ProductsStatsServer from "@/src/components/features/partner/dashboard/products/ProductsStatsServer";
import ProductsServer from "@/src/components/features/partner/dashboard/products/productsList/ProductServer";
import ProductsSkeleton from "@/src/components/features/partner/dashboard/products/productsList/ProductsSkeleton";
import { Suspense } from "react";

export default function ProductsPage() {
  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <h1 className="font-semibold">Productos</h1>
      <h2 className="font-roboto font-normal mb-5">Gestiona tus productos</h2>
      {/* Fila 1: Tarjetas de Estadísticas */}
      <Suspense fallback={<StatSectionSkeleton count={3} />}>
        <ProductsStatsServer />
      </Suspense>
      {/* Fila 2: Lista de Productos */}
      <section className="bg-white px-10 py-6 rounded-xl">
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsServer />
        </Suspense>
      </section>
    </div>
  );
}
