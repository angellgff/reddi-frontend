import getStoreMenu from "@/src/lib/finalUser/stores/getStoreMenu";
import StoreMenu from "./StoreMenu";
import getStoreDetails from "@/src/lib/finalUser/stores/getStoreDetails";

export default async function StoreMenuServer({
  id,
  category,
  q,
}: {
  id: string;
  category?: string | string[];
  q?: string | string[];
}) {
  // Cargamos en paralelo el menú y el tipo de partner para decidir la tarjeta a mostrar
  const [storeDetails, menu] = await Promise.all([
    getStoreDetails(id),
    getStoreMenu(id, { category, q }),
  ]);

  return <StoreMenu menu={menu} partnerType={storeDetails.partner_type} />;
}
