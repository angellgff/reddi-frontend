import { Suspense } from "react";
import StoreHeader from "../../../../../components/features/finalUser/store/StoreHeader";
import StoreMenuServer from "../../../../../components/features/finalUser/store/StoreMenuServer";
import StoreMenuSkeleton from "../../../../../components/features/finalUser/store/StoreMenuSkeleton";
import getStoreDetails from "@/src/lib/finalUser/stores/getStoreDetails";
import Link from "next/link";

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { category, q } = await searchParams;

  let store;
  try {
    store = await getStoreDetails(id);
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Tienda no encontrada
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Lo sentimos, no pudimos encontrar la tienda que buscas. Es posible
            que haya sido eliminada o la dirección sea incorrecta.
          </p>
        </div>
        <Link
          href="/user/home"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!store.is_active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Tienda no disponible
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Esta tienda se encuentra temporalmente inactiva. Por favor, intenta
            más tarde o busca otras opciones.
          </p>
        </div>
        <Link
          href="/user/home"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary/90 transition-colors"
        >
          Explorar otras tiendas
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-0 md:px-12 py-6">
        {/* Encabezado de la tienda */}
        <section>
          <StoreHeader store={store} />
        </section>

        {/* Menú de la tienda (categorías y productos) */}
        <section className="px-4 md:px-0">
          <Suspense fallback={<StoreMenuSkeleton />}>
            <StoreMenuServer
              id={id}
              category={category}
              q={q}
              partnerType={store.partner_type}
            />
          </Suspense>
        </section>
      </div>
    </>
  );
}
