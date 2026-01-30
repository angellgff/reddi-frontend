"use server";

import getProductDetails from "@/src/lib/finalUser/stores/getProductDetails";
import { createClient } from "@/src/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";

export async function getProductDetailsAction(
  partnerId: string,
  productId: string,
) {
  try {
    const details = await getProductDetails(partnerId, productId);
    return details;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching product details", error);
    return null;
  }
}
