import { Suspense } from "react";
import getStoreDetails from "@/src/lib/finalUser/stores/getStoreDetails";
import Link from "next/link";
import getStoreMenu from "@/src/lib/finalUser/stores/getStoreMenu";
import StoreCategoriesClient from "@/src/components/features/finalUser/store/StoreCategoriesClient";

export default async function StoreCategoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Validate Store
  let store;
  try {
    store = await getStoreDetails(id);
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-xl font-bold">Tienda no encontrada</h1>
        <Link href="/user/home" className="text-primary mt-4">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!store.is_active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-xl font-bold">Tienda no disponible</h1>
        <Link href="/user/home" className="text-primary mt-4">
          Explorar otras tiendas
        </Link>
      </div>
    );
  }

  // 2. Fetch Full Menu (no filtering)
  const menu = await getStoreMenu(id, { partnerType: store.partner_type });

  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen">
      <StoreCategoriesClient
        menu={menu}
        partnerType={store.partner_type}
        storeName={store.name}
      />
    </div>
  );
}
