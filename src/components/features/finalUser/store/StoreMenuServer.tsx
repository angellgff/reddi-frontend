import getStoreMenu from "@/src/lib/finalUser/stores/getStoreMenu";
import StoreMenu from "./StoreMenu";

export default async function StoreMenuServer({
  id,
  category,
  q,
}: {
  id: string;
  category?: string | string[];
  q?: string | string[];
}) {
  const menu = await getStoreMenu(id, { category, q });
  return <StoreMenu menu={menu} />;
}
