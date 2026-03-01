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

export async function confirmDeliveryPinAction(orderId: string, pin: string) {
  const debugId = `pin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const normalizedPin = String(pin ?? "").trim();

  console.info("[confirmDeliveryPinAction] start", {
    debugId,
    orderId,
    pinLength: normalizedPin.length,
    pinMasked: normalizedPin
      ? `${"*".repeat(Math.max(0, normalizedPin.length - 1))}${normalizedPin.slice(-1)}`
      : "",
  });

  if (!/^\d{4}$/.test(normalizedPin)) {
    console.warn("[confirmDeliveryPinAction] invalid-pin-format", {
      debugId,
      orderId,
      pinLength: normalizedPin.length,
    });
    return {
      success: false,
      error: "El PIN debe contener 4 dígitos.",
      errorCode: "INVALID_PIN_FORMAT",
      debugId,
    };
  }

  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[confirmDeliveryPinAction] auth-failed", {
        debugId,
        orderId,
        authError,
      });
      return {
        success: false,
        error: "No autorizado para validar PIN.",
        errorCode: "UNAUTHORIZED",
        debugId,
      };
    }

    const { data, error } = await supabase.rpc("confirm_delivery_with_pin", {
      p_order_id: orderId,
      p_pin: normalizedPin,
      p_user_id: user.id,
    });

    if (error) {
      console.error("[confirmDeliveryPinAction] rpc-error", {
        debugId,
        orderId,
        userId: user.id,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return {
        success: false,
        error: error.message || "No se pudo validar el PIN",
        errorCode: error.code || "RPC_ERROR",
        errorDetails: error.details || null,
        errorHint: error.hint || null,
        debugId,
      };
    }

    console.info("[confirmDeliveryPinAction] success", {
      debugId,
      orderId,
      userId: user.id,
      result: data,
    });

    return { success: true, data, debugId };
  } catch (err: any) {
    console.error("[confirmDeliveryPinAction] unexpected-exception", {
      debugId,
      orderId,
      error: err,
    });
    return {
      success: false,
      error: err?.message || "No se pudo validar el PIN",
      errorCode: "UNEXPECTED_EXCEPTION",
      debugId,
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
