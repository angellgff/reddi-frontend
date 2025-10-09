import getStoreDetails from "@/src/lib/finalUser/stores/getStoreDetails";
import StoreHeader from "./StoreHeader";

export default async function StoreHeaderServer({ id }: { id: string }) {
  const store = await getStoreDetails(id);
  return <StoreHeader store={store} />;
}
