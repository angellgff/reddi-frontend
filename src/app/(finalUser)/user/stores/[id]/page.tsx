import { Suspense } from "react";
import StoreHeaderServer from "../../../../../components/features/finalUser/store/StoreHeaderServer";
import StoreHeaderSkeleton from "../../../../../components/features/finalUser/store/StoreHeaderSkeleton";
import StoreMenuServer from "../../../../../components/features/finalUser/store/StoreMenuServer";
import StoreMenuSkeleton from "../../../../../components/features/finalUser/store/StoreMenuSkeleton";
import GuestFooter from "@/src/components/features/layout/GuestFooter";

// Page params come directly (not Promises) from Next.js App Router
export default async function StorePage({ params, searchParams }: any) {
  const { id } = params;
  const { category, q } = searchParams;

  return (
    <>
      <div className="max-w-7xl mx-auto px-0 md:px-12 py-6 space-y-4">
        {/* Encabezado de la tienda */}
        <section>
          <Suspense fallback={<StoreHeaderSkeleton />}>
            <StoreHeaderServer id={id} />
          </Suspense>
        </section>

        {/* Menú de la tienda (categorías y productos) */}
        <section className="px-4 md:px-0">
          <Suspense fallback={<StoreMenuSkeleton />}>
            <StoreMenuServer id={id} category={category} q={q} />
          </Suspense>
        </section>
      </div>
      <GuestFooter />
    </>
  );
}
