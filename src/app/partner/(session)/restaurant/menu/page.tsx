import StatSectionSkeleton from "@/src/components/features/partner/stats/StatSectionSkeleton";
import MenuStatsServer from "@/src/components/features/partner/dashboard/menu/MenuStatsServer";
import DishesServer from "@/src/components/features/partner/dashboard/menu/dishesList/DishesServer";
import ProductsSkeleton from "@/src/components/features/partner/dashboard/products/productsList/ProductsSkeleton";
import { Suspense } from "react";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, tag, q } = await searchParams;

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      {/* Título */}
      <h1 className="font-semibold">Menú</h1>
      <h2 className="font-roboto font-normal mb-5">Gestiona tus platillos</h2>
      {/* Fila 1: Tarjetas de Estadísticas */}
      <Suspense fallback={<StatSectionSkeleton count={3} />}>
        <MenuStatsServer />
      </Suspense>
      {/* Fila 2: Lista de Productos */}
      <section className="bg-white px-10 py-6 rounded-xl">
        <Suspense fallback={<ProductsSkeleton />}>
          <DishesServer category={category} tag={tag} q={q} />
        </Suspense>
      </section>
    </div>
  );
}
