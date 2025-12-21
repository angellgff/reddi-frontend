import getStoreMenu from "@/src/lib/finalUser/stores/getStoreMenu";
import StoreMenu from "./StoreMenu";
import { Database } from "@/src/lib/database.types";

type PartnerType = Database["public"]["Enums"]["partner_type"];

export default async function StoreMenuServer({
  id,
  category,
  q,
  partnerType,
}: {
  id: string;
  category?: string | string[];
  q?: string | string[];
  partnerType: PartnerType;
}) {
  const menu = await getStoreMenu(id, { category, q });

  return <StoreMenu menu={menu} partnerType={partnerType} />;
}
