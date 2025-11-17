import getOrderDetail from "@/src/lib/repartidor/order/getOrderDetail";
import OrderDetailCard from "./OrderDetailCard";

export default async function OrderDetailServer({
  orderId,
}: {
  orderId: string;
}) {
  const data = await getOrderDetail(orderId);
  return (
    <div className="flex flex-col items-center pb-10 w-[384px] mx-auto">
      <h2 className="w-full text-left text-[18px] font-semibold text-slate-900 mb-4 px-4">
        Pedido en curso
      </h2>
      <OrderDetailCard data={data} />
    </div>
  );
}
