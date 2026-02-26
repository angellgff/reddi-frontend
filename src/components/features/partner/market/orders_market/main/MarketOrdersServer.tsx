import MarketOrdersSection from "@/src/components/features/partner/market/orders_market/main/MarketOrdersSection";
import getOrdersListData, {
  getScheduledOrdersCount,
} from "@/src/lib/partner/orders/getOrdersListData";
import { PartnerOrderCardProps } from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import getOrderDetailsData from "@/src/lib/partner/orders/getOrderDetailsData";

interface MarketOrdersServerProps {
  category: string | string[] | undefined;
  cursor?: string | string[] | undefined;
}

export default async function MarketOrdersServer({
  category,
  cursor,
}: MarketOrdersServerProps) {
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

  const preparationOrders = transformed.filter(
    (o) => o.status === "preparation",
  );
  const detailCandidates = preparationOrders.slice(0, 8);

  const detailEntries = await Promise.all(
    detailCandidates.map(async (order) => {
      try {
        const data = await getOrderDetailsData(order.orderId);
        return [
          order.orderId,
          {
            orderId: data.orderId,
            items: data.items.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            total: data.total,
            addressDetails: data.address.details,
            instructions: data.instructions,
          },
        ] as const;
      } catch {
        return null;
      }
    }),
  );

  const orderDetailsById = Object.fromEntries(
    detailEntries.filter(
      (
        entry,
      ): entry is readonly [
        string,
        {
          orderId: string;
          items: {
            id: string;
            name: string;
            quantity: number;
            price: number;
          }[];
          total: number;
          addressDetails: string;
          instructions?: string | null;
        },
      ] => Boolean(entry),
    ),
  );

  return (
    <MarketOrdersSection
      tabs={hardCodedTabs}
      orders={transformed}
      orderDetailsById={orderDetailsById}
      scheduledCount={scheduledCount}
    />
  );
}
