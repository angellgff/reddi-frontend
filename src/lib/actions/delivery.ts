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

export async function acceptDeliveryOrderAction(orderId: string) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabase.rpc("accept_order", {
      p_order_id: orderId,
      p_user_id: user.id,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data && typeof data === "object" && "error" in data) {
      return { success: false, error: (data as { error: string }).error };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Unexpected server error",
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

export async function updateDriverLocationAction(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { success: false, error: "Invalid coordinates" };
  }

  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const locationPoint = `POINT(${lng} ${lat})`;
    const { error } = await supabase
      .from("drivers")
      .update({ current_location: locationPoint as any })
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Unexpected server error",
    };
  }
}
