import MarketOrderTrackingData, {
  OrderTrackingInfo,
} from "@/src/lib/partner/orders/getOrderTrackingData";
import MarketOrderTrackingView from "./MarketOrderTrackingView";

interface MarketOrderTrackingServerProps {
  id: string;
}

export default async function MarketOrderTrackingServer({
  id,
}: MarketOrderTrackingServerProps) {
  const orderData: OrderTrackingInfo = await MarketOrderTrackingData(id);
  return (
    <MarketOrderTrackingView
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
