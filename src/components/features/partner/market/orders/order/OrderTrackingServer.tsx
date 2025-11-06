import OrderTrackingData, {
  OrderTrackingInfo,
} from "@/src/lib/partner/orders/getOrderTrackingData";
import OrderTracking from "./OrderTracking";

interface OrderTrackingServerProps {
  id: string;
}

export default async function OrderTrackingServer({
  id,
}: OrderTrackingServerProps) {
  const orderData: OrderTrackingInfo = await OrderTrackingData(id);
  return (
    <OrderTracking
      orderData={{
        id: orderData.id,
        customerName: orderData.customerName,
        paymentMethod: orderData.paymentMethod,
      }}
      partnerId={orderData.partnerId}
      userAddressId={orderData.userAddressId}
    />
  );
}
