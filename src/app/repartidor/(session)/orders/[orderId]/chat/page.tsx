import { createClient } from "@/src/lib/supabase/server";
import ChatPageClient from "./ChatPageClient";
import getOrderDetail from "@/src/lib/repartidor/order/getOrderDetail";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function GenericChatPage({ params }: Props) {
  const { orderId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Autenticación requerida</div>;
  }

  // Obtenemos los detalles de la orden para saber el nombre del cliente y asegurarnos que existe/tiene permiso
  const orderData = await getOrderDetail(orderId);

  if (!orderData) {
    return <div>Pedido no encontrado</div>;
  }

  return (
    <ChatPageClient
      orderId={orderId}
      customerName={orderData.customerName}
      currentUserId={user.id}
    />
  );
}
