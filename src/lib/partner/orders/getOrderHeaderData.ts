"use server";

import { mockedOrders } from "@/src/app/partner/(session)/restaurant/orders/[id]/page";

export default async function getOrderHeaderData(id: string) {
  const order = mockedOrders.find((order) => order.orderId === id);
  if (!order) {
    throw new Error("Order not found");
  }
  return { status: order.status, timeRemaining: order.timeRemaining };
}
