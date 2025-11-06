"use server";

import { createClient } from "@/src/lib/supabase/server";

export type OrderTrackingInfo = {
  id: string;
  customerName: string;
  paymentMethod: string;
  deliveryName: string;
  partnerId: string | null;
  userAddressId: string | null;
};

export default async function OrderTrackingData(
  id: string
): Promise<OrderTrackingInfo> {
  const supabase = await createClient();

  // Obtener order con user_id y payment info
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id, payment_intent_id, user_address_id, partner_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!order) throw new Error("Order not found");

  // Perfil del cliente
  let customerName = "Cliente";
  if (order.user_id) {
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", order.user_id)
      .maybeSingle();
    if (profErr) throw profErr;
    if (prof) {
      customerName =
        [prof.first_name, prof.last_name].filter(Boolean).join(" ").trim() ||
        "Cliente";
    }
  }

  const paymentMethod = order.payment_intent_id ? "Tarjeta" : "Débito";

  // Aún no tenemos repartidor asignado en el esquema
  const deliveryName = "Repartidor no asignado";

  return {
    id: order.id,
    customerName,
    paymentMethod,
    deliveryName,
    partnerId: order.partner_id as string | null,
    userAddressId: order.user_address_id as string | null,
  };
}
