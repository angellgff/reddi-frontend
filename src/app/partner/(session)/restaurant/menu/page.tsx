import StatSectionSkeleton from "@/src/components/features/partner/stats/StatSectionSkeleton";
import MenuStatsServer from "@/src/components/features/partner/dashboard/menu/MenuStatsServer";
import DishesServer from "@/src/components/features/partner/dashboard/menu/dishesList/DishesServer";
import ProductsSkeleton from "@/src/components/features/partner/dashboard/products/productsList/ProductsSkeleton";
import CreateDishModalServer from "@/src/components/features/partner/dashboard/menu/newDish/CreateDishModalServer";
import EditDishModalServer from "@/src/components/features/partner/dashboard/menu/editDish/EditDishModalServer";
import LoadingDishFormModal from "@/src/components/features/partner/dashboard/shared/LoadingDishFormModal";
import { Suspense } from "react";
import Link from "next/link";

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, tag, q, available, create, edit } = await searchParams;
  const shouldOpenCreate = getSearchParam(create) === "true";
  const editId = getSearchParam(edit);

  const baseParams = new URLSearchParams();
  const qValue = getSearchParam(q);
  const categoryValue = getSearchParam(category);
  const tagValue = getSearchParam(tag);
  const availableValue = getSearchParam(available);

  if (qValue) baseParams.set("q", qValue);
  if (categoryValue) baseParams.set("category", categoryValue);
  if (tagValue) baseParams.set("tag", tagValue);
  if (availableValue) baseParams.set("available", availableValue);

  const paramsString = baseParams.toString();
  const baseHref = paramsString
    ? `/partner/restaurant/menu?${paramsString}`
    : "/partner/restaurant/menu";

  return (
    <div className="min-h-screen bg-[#F6F6F6] px-8 py-4">
      <Suspense fallback={<StatSectionSkeleton count={3} />}>
        <MenuStatsServer />
      </Suspense>

      <section className="mt-4 rounded-xl bg-white px-6 py-6">
        <div className="mb-5 flex justify-end">
          <Link
            href="/partner/restaurant/menu/editor"
            className="rounded-xl border border-[#D9DCE3] bg-[#F8F9FB] px-4 py-2 text-sm font-semibold text-[#1E293B] hover:bg-[#EEF2F7]"
          >
            Reordenar en vista móvil
          </Link>
        </div>

        <Suspense fallback={editId ? null : <ProductsSkeleton />}>
          <DishesServer
            category={category}
            tag={tag}
            q={q}
            available={available}
          />
        </Suspense>
      </section>

      {shouldOpenCreate ? (
        <Suspense fallback={null}>
          <CreateDishModalServer closeHref={baseHref} successHref={baseHref} />
        </Suspense>
      ) : null}

      {editId ? (
        <Suspense fallback={<LoadingDishFormModal closeHref={baseHref} />}>
          <EditDishModalServer
            id={editId}
            closeHref={baseHref}
            successHref={baseHref}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
