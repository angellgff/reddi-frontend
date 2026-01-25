import { createClient } from "@/src/lib/supabase/server";
import UserChatPageClient from "./UserChatPageClient";
import { getOrderDetails } from "@/src/lib/finalUser/orders/getOrderDetails";
import { getAssignedDriverForOrder } from "@/src/components/features/finalUser/orders/actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserChatPage({ params }: Props) {
  const { id: orderId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Autenticación requerida</div>;
  }

  // Fetch driver info
  const driverInfo = await getAssignedDriverForOrder(orderId);
  const driverName = driverInfo.user 
    ? (driverInfo.user.first_name + " " + driverInfo.user.last_name).trim() || driverInfo.user.email 
    : "Conductor";

  return (
    <UserChatPageClient
      orderId={orderId}
      driverId={driverInfo.assigned ? driverInfo.user.id : ""}
      driverName={driverName}
      driverImage={null} // TODO: Add driver.avatar if available
      currentUserId={user.id}
    />
  );
}
