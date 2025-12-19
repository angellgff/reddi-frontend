import MarketOrderTrackingData, {
  OrderTrackingInfo,
} from "@/src/lib/partner/orders/getOrderTrackingData";
import ClientOrderTrackingView from "./ClientOrderTrackingView";

interface ClientOrderTrackingServerProps {
  id: string;
}

export default async function ClientOrderTrackingServer({
  id,
}: ClientOrderTrackingServerProps) {
  const orderData: OrderTrackingInfo = await MarketOrderTrackingData(id);
  return (
    <ClientOrderTrackingView
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
