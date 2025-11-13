import OrdersTableClient from "./OrdersTableClient";
import { OrderFilters } from "@/src/lib/admin/data/orders/getOrders";
import getOrdersPage from "@/src/lib/admin/data/orders/getOrdersPage";

type OrdersTableSearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function OrdersTableServer({
  searchParams,
}: {
  searchParams?: OrdersTableSearchParams;
}) {
  const awaitedSearchParams = await Promise.resolve(searchParams || {});

  const getFirst = (value: string | string[] | undefined): string => {
    return Array.isArray(value) ? value[0] || "" : value || "";
  };

  const pageParam = getFirst(awaitedSearchParams.page);
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const pageSize = 10;

  const filters: OrderFilters = {
    search: getFirst(awaitedSearchParams.q) || undefined,
    from: getFirst(awaitedSearchParams.from) || undefined,
    to: getFirst(awaitedSearchParams.to) || undefined,
    status: (getFirst(awaitedSearchParams.status) as any) || undefined,
    category: (getFirst(awaitedSearchParams.category) as any) || undefined,
  };

  const { orders, total } = await getOrdersPage(filters, pageSize, page);
  return (
    <OrdersTableClient
      orders={orders}
      page={page}
      total={total}
      pageSize={pageSize}
    />
  );
}
