import MarketOrdersSection from "@/src/components/features/partner/market/orders_market/main/MarketOrdersSection";
import getOrdersListData from "@/src/lib/partner/orders/getOrdersListData";
import { PartnerOrderCardProps } from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";

interface MarketOrdersServerProps {
  category: string | string[] | undefined;
  cursor?: string | string[] | undefined;
}

const hardCodedTabs = [
  { value: "", label: "Todos" },
  { value: "today", label: "Hoy" },
  { value: "pending", label: "Pendientes" },
  { value: "preparation", label: "En preparación" },
  { value: "delivered", label: "Entregados" },
];

export default async function MarketOrdersServer({
  category,
  cursor,
}: MarketOrdersServerProps) {
  const mockedOrders = await getOrdersListData(category, cursor);
  const transformed = mockedOrders.map((o: PartnerOrderCardProps) => ({
    customerName: o.customerName,
    orderId: o.orderId,
    status: o.status,
    timeRemaining: o.timeRemaining,
    products: o.products,
    total: o.total,
    paymentMethod: o.paymentMethod,
    deliveryTime: o.deliveryTime,
  }));
  return <MarketOrdersSection tabs={hardCodedTabs} orders={transformed} />;
}
