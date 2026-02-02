import StoreCategoriesClient from "@/src/components/features/finalUser/store/StoreCategoriesClient";
import getStoreDetails from "@/src/lib/finalUser/stores/getStoreDetails";
import getStoreMenu from "@/src/lib/finalUser/stores/getStoreMenu";
import Link from "next/link";

export default async function StoreCategoriesInterceptedPage({
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
    <StoreCategoriesClient
      menu={menu}
      partnerType={store.partner_type}
      storeName={store.name}
    />
  );
}
