import OrderTrackingData from "@/src/lib/partner/orders/getOrderTrackingData";
import OrderTracking from "./OrderTracking";

interface OrderTrackingServerProps {
  id: string;
}

export default async function OrderTrackingServer({
  id,
}: OrderTrackingServerProps) {
  const orderData = await OrderTrackingData(id);
  return <OrderTracking orderData={orderData} />;
}
