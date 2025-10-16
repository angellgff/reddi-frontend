import OrdersSection from "@/src/components/features/partner/market/orders/main/OrdersSection";
import getOrdersListData from "@/src/lib/partner/orders/getOrdersListData";

interface OrdersServerProps {
  category: string | string[] | undefined;
}

const hardCodedTabs = [
  { value: "", label: "Todos" },
  { value: "today", label: "Hoy" },
  { value: "pending", label: "Pendientes" },
  { value: "preparation", label: "En preparación" },
  { value: "delivered", label: "Entregados" },
];

export default async function OrdersServer({ category }: OrdersServerProps) {
  // Se hace la petición al servidor para obtener las órdenes
  const mockedOrders = await getOrdersListData(category);
  return (
    <OrdersSection
      // Las tabs vienen desde la base de datos o están hardcodeadas, decide tú
      tabs={hardCodedTabs}
      orders={mockedOrders}
    />
  );
}
