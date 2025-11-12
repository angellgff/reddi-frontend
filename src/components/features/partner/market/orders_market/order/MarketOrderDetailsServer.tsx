import MarketOrderDetails from "./MarketOrderDetails";
import getOrderDetailsData from "@/src/lib/partner/orders/getOrderDetailsData";

export default async function MarketOrderDetailsServer({ id }: { id: string }) {
  const orderData = await getOrderDetailsData(id);
  return <MarketOrderDetails order={orderData} />;
}
