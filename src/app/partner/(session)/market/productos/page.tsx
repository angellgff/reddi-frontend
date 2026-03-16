import StatSectionSkeleton from "@/src/components/features/partner/stats/StatSectionSkeleton";
import ProductsStatsServer from "@/src/components/features/partner/dashboard/products/ProductsStatsServer";
import ProductsServer from "@/src/components/features/partner/dashboard/products/productsList/ProductServer";
import ProductsSkeleton from "@/src/components/features/partner/dashboard/products/productsList/ProductsSkeleton";
import MarketEditProductModalServer from "@/src/components/features/partner/dashboard/market/editProduct/MarketEditProductModalServer";
import MarketCreateProductModalServer from "@/src/components/features/partner/dashboard/market/newProduct/MarketCreateProductModalServer";
import LoadingDishFormModal from "@/src/components/features/partner/dashboard/shared/LoadingDishFormModal";
import { Suspense } from "react";

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q, category, available, edit, create } = await searchParams;
  const editId = getSearchParam(edit);
  const shouldOpenCreate = getSearchParam(create) === "true";

  const baseParams = new URLSearchParams();
  const qValue = getSearchParam(q);
  const categoryValue = getSearchParam(category);
  const availableValue = getSearchParam(available);

  if (qValue) baseParams.set("q", qValue);
  if (categoryValue) baseParams.set("category", categoryValue);
  if (availableValue) baseParams.set("available", availableValue);

  const paramsString = baseParams.toString();
  const baseHref = paramsString
    ? `/partner/market/productos?${paramsString}`
    : "/partner/market/productos";

  return (
    <div className="min-h-screen bg-[#F6F6F6] px-8 py-4">
      <Suspense fallback={<StatSectionSkeleton count={3} />}>
        <ProductsStatsServer />
      </Suspense>
      <section className="mt-4 rounded-xl bg-white px-6 py-6">
        <Suspense fallback={editId ? null : <ProductsSkeleton />}>
          <ProductsServer q={q} category={category} available={available} />
        </Suspense>
      </section>

      {editId ? (
        <Suspense fallback={<LoadingDishFormModal closeHref={baseHref} />}>
          <MarketEditProductModalServer id={editId} closeHref={baseHref} />
        </Suspense>
      ) : null}

      {shouldOpenCreate ? (
        <Suspense fallback={null}>
          <MarketCreateProductModalServer closeHref={baseHref} />
        </Suspense>
      ) : null}
    </div>
  );
}
