"use server";

import { createClient } from "@/src/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";

interface AzulParams {
  orderId: string;
  amount: string;
  authCode: string;
  rrn: string;
  responseCode: string;
  responseMessage: string;
  cardNumber: string;
  errorDesc: string;
  dateTime: string;
  azulOrderId: string;
}

export async function updateOrderAfterPayment(
  orderId: string,
  azulParams: AzulParams,
) {
  try {
    const supabase = await createClient();

    // 1. Obtener la orden para saber el user_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      return { success: false, error: "Order not found" };
    }

    // 2. Registrar el pago en la tabla payments
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: orderId,
      user_id: order.user_id,
      amount: parseFloat(azulParams.amount),
      currency: "DOP", // Azul opera principalmente en pesos
      provider: "azul",
      status: "completed",
      transaction_id: azulParams.rrn,
      authorization_code: azulParams.authCode,
      card_number: azulParams.cardNumber,
      metadata: azulParams,
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return { success: false, error: paymentError.message };
    }

    // 3. Actualizar el estado de la orden
    const { error } = await supabase
      .from("orders")
      .update({
        status: "pending",
        payment_intent_id: azulParams.rrn,
        payment_meta: azulParams,
        payment_provider: "azul",
      })
      .eq("id", orderId);

    if (error) {
      console.error("Supabase Error updating order:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    Sentry.captureException(err);
    console.error("Unexpected error in updateOrderAfterPayment:", err);
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "string") {
      errorMessage = err;
    }
    return { success: false, error: errorMessage };
  }
}
