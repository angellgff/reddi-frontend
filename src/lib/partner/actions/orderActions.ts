"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";

/**
 * Server action to accept an order and update its status to 'preparing'
 * @param orderId - The ID of the order to accept
 * @returns Object with success status and optional error message
 */
export async function acceptOrder(orderId: string) {
  try {
    const supabase = await createClient();

    // Update DB status to 'preparing' (DB enum)
    const { error } = await supabase
      .from("orders")
      .update({ status: "preparing" })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status to preparing:", error);
      return {
        success: false,
        error: error.message || "Failed to update order status",
      };
    }

    // Revalidate the paths that might display this order
    revalidatePath("/partner/market/orders");
    revalidatePath("/partner/market/orders_market");
    revalidatePath(`/partner/market/orders/${orderId}`);
    revalidatePath(`/partner/market/orders_market/${orderId}`);

    return { success: true };
  } catch (err: unknown) {
    Sentry.captureException(err);
    console.error("Unexpected error in acceptOrder:", err);
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "string") {
      errorMessage = err;
    }
    return { success: false, error: errorMessage };
  }
}
