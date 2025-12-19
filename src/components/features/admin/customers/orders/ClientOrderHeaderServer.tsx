"use server";

import ClientOrderHeader from "./ClientOrderHeader";
import getOrderHeaderData from "@/src/lib/partner/orders/getOrderHeaderData";

interface ClientOrderHeaderServerProps {
  id: string;
}

export default async function ClientOrderHeaderServer({
  id,
}: ClientOrderHeaderServerProps) {
  const {
    status: initialStatus,
    timeRemaining,
    customerName,
  } = await getOrderHeaderData(id);
  return (
    <ClientOrderHeader
      id={id}
      initialStatus={initialStatus}
      timeRemaining={timeRemaining}
      customerName={customerName}
    />
  );
}
