import OrderDetails from "@/src/components/features/partner/market/orders/order/OrderDetails";
import getOrderDetailsData from "@/src/lib/partner/orders/getOrderDetailsData";

export default async function OrderDetailsServer({ id }: { id: string }) {
  const orderData = await getOrderDetailsData(id);
  return <OrderDetails order={orderData} />;
}
