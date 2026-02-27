import MarketOrdersSection from "@/src/components/features/partner/market/orders_market/main/MarketOrdersSection";
import getOrdersListData, {
  getOrderIndicatorCounts,
} from "@/src/lib/partner/orders/getOrdersListData";
import { PartnerOrderCardProps } from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import getOrderDetailsData from "@/src/lib/partner/orders/getOrderDetailsData";
import { createClient } from "@/src/lib/supabase/server";

interface MarketOrdersServerProps {
  category: string | string[] | undefined;
  cursor?: string | string[] | undefined;
}

export default async function MarketOrdersServer({
  category,
  cursor,
}: MarketOrdersServerProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const partnerIdPromise = user
    ? supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null } as const);

  const [mockedOrders, indicatorCounts, partnerResult] = await Promise.all([
    getOrdersListData(category, cursor),
    getOrderIndicatorCounts(),
    partnerIdPromise,
  ]);
  const scheduledCount = indicatorCounts.scheduled;
  const partnerId = partnerResult.data?.id ?? null;

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

  const detailCandidates = transformed.slice(0, 20);

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
      (entry): entry is NonNullable<(typeof detailEntries)[number]> =>
        entry !== null,
    ),
  );

  return (
    <MarketOrdersSection
      tabs={hardCodedTabs}
      orders={transformed}
      orderDetailsById={orderDetailsById}
      scheduledCount={scheduledCount}
      indicatorCounts={indicatorCounts}
      partnerId={partnerId}
    />
  );
}
