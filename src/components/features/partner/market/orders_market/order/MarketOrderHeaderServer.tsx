"use server";

import MarketOrderHeader from "./MarketOrderHeader";
import getOrderHeaderData from "@/src/lib/partner/orders/getOrderHeaderData";

interface MarketOrderHeaderServerProps {
  id: string;
}

export default async function MarketOrderHeaderServer({
  id,
}: MarketOrderHeaderServerProps) {
  const {
    status: initialStatus,
    timeRemaining,
    customerName,
  } = await getOrderHeaderData(id);
  return (
    <MarketOrderHeader
      id={id}
      initialStatus={initialStatus}
      timeRemaining={timeRemaining}
      customerName={customerName}
    />
  );
}
