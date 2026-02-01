"use server";

import { createClient } from "@/src/lib/supabase/server";

export async function completeDeliveryAction(
  orderId: string,
  driverId: string,
  method: "cash" | "physical_pos",
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("complete_delivery_and_pay", {
      p_order_id: orderId,
      p_driver_id: driverId,
      p_collected_method: method,
    });

    if (error) {
      console.error("RPC Error (Server Action):", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return {
      success: false,
      error: err.message || "Error desconocido en el servidor",
    };
  }
}

export async function updateShipmentStatusAction(
  shipmentId: string | null,
  newStatus: string,
) {
  if (!shipmentId)
    return { success: false, error: "No hay shipmentId asignado" };

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("shipments")
      .update({ status: newStatus })
      .eq("id", shipmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
