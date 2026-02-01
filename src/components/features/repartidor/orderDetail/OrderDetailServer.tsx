import getOrderDetail from "@/src/lib/repartidor/order/getOrderDetail";
import OrderDetailCard from "./OrderDetailCard";

export default async function OrderDetailServer({
  orderId,
}: {
  orderId: string;
}) {
  const data = await getOrderDetail(orderId);
  return (
    <div className="w-full flex justify-center">
      <OrderDetailCard data={data} />
    </div>
  );
}
