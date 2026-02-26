import StatSectionSkeleton from "@/src/components/features/partner/stats/StatSectionSkeleton";
import ProductsStatsServer from "@/src/components/features/partner/dashboard/products/ProductsStatsServer";
import ProductsServer from "@/src/components/features/partner/dashboard/products/productsList/ProductServer";
import ProductsSkeleton from "@/src/components/features/partner/dashboard/products/productsList/ProductsSkeleton";
import { Suspense } from "react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q, category, available } = await searchParams;

  return (
    <div className="min-h-screen bg-[#F6F6F6] px-8 py-4">
      <Suspense fallback={<StatSectionSkeleton count={3} />}>
        <ProductsStatsServer />
      </Suspense>
      <section className="mt-4 rounded-xl bg-white px-6 py-6">
        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsServer q={q} category={category} available={available} />
        </Suspense>
      </section>
    </div>
  );
}
