import OrdersSection from "@/src/components/features/partner/market/orders/main/OrdersSection";
import getOrdersListData, {
  getScheduledOrdersCount,
} from "@/src/lib/partner/orders/getOrdersListData";

interface OrdersServerProps {
  category: string | string[] | undefined;
  cursor?: string | string[] | undefined;
}

export default async function OrdersServer({
  category,
  cursor,
}: OrdersServerProps) {
  const [mockedOrders, scheduledCount] = await Promise.all([
    getOrdersListData(category, cursor),
    getScheduledOrdersCount(),
  ]);

  const hardCodedTabs = [
    { value: "", label: "Todos" },
    { value: "today", label: "Hoy" },
    { value: "scheduled", label: `Programados (${scheduledCount})` },
    { value: "pending", label: "Pendientes" },
    { value: "preparation", label: "En preparación" },
    { value: "delivered", label: "Entregados" },
  ];

  return <OrdersSection tabs={hardCodedTabs} orders={mockedOrders} />;
}
