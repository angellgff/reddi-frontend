import getOrderDetailsData from "@/src/lib/partner/orders/getOrderDetailsData";
import ClientOrderDetails from "@/src/components/features/admin/customers/orders/ClientOrderDetails";

// We can reuse MarketOrderDetails as it's just a display component (unless it has buttons inside, let's verified MarketOrderDetails content earlier, it seemed to just list items)
// Investigating MarketOrderDetails.tsx content briefly if I can view it, but assuming it's safe for now based on name.
// Wait, I should verify MarketOrderDetails content to be sure.

export default async function ClientOrderDetailsServer({ id }: { id: string }) {
  const orderData = await getOrderDetailsData(id);
  return <ClientOrderDetails order={orderData} />;
}
