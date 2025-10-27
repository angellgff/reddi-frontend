"use server";

import OrderHeader from "@/src/components/features/partner/market/orders/order/OrderHeader";
import getOrderHeaderData from "@/src/lib/partner/orders/getOrderHeaderData";

interface OrderHeaderServer {
  id: string;
}

export default async function OrderHeaderServer({ id }: OrderHeaderServer) {
  const {
    status: initialStatus,
    timeRemaining,
    customerName,
  } = await getOrderHeaderData(id);
  return (
    <OrderHeader
      id={id}
      initialStatus={initialStatus}
      timeRemaining={timeRemaining}
      customerName={customerName}
    />
  );
}
