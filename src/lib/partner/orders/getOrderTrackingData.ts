const trackingData = [
  {
    id: 22341,
    customerName: "María González",
    paymentMethod: "Tarjeta",
    deliveryName: "Carlos Ramírez",
  },
  {
    id: 22342,
    customerName: "María González",
    paymentMethod: "Tarjeta",
    deliveryName: "Carlos Ramírez",
  },
  {
    id: 22343,
    customerName: "María González",
    paymentMethod: "Tarjeta",
    deliveryName: "Carlos Ramírez",
  },
];

export default async function OrderTrackingData(id: string) {
  const order = trackingData.find((order) => order.id === Number(id));
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula una llamada a API
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
}
