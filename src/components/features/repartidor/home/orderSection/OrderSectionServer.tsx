import OrderCardSection from "./OrderCardSection";
import getOrdersData from "@/src/lib/repartidor/home/getOrdersData";

export default async function OrderSectionServer() {
  const data = await getOrdersData();
  return <OrderCardSection orders={data} />;
}
