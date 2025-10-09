import { Suspense } from "react";
import StoreHeaderServer from "../../../../../components/features/finalUser/store/StoreHeaderServer";
import StoreHeaderSkeleton from "../../../../../components/features/finalUser/store/StoreHeaderSkeleton";
import StoreMenuServer from "../../../../../components/features/finalUser/store/StoreMenuServer";
import StoreMenuSkeleton from "../../../../../components/features/finalUser/store/StoreMenuSkeleton";

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { category, q } = await searchParams;

  return (
    <div className="p-4 space-y-6">
      {/* Encabezado de la tienda */}
      <section>
        <Suspense fallback={<StoreHeaderSkeleton />}>
          <StoreHeaderServer id={id} />
        </Suspense>
      </section>

      {/* Menú de la tienda (categorías y productos) */}
      <section>
        <Suspense fallback={<StoreMenuSkeleton />}>
          <StoreMenuServer id={id} category={category} q={q} />
        </Suspense>
      </section>
    </div>
  );
}
