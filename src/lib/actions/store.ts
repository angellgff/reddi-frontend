"use server";

import getProductDetails from "@/src/lib/finalUser/stores/getProductDetails";
import { createClient } from "@/src/lib/supabase/server";

export async function getProductDetailsAction(
  partnerId: string,
  productId: string,
) {
  try {
    const details = await getProductDetails(partnerId, productId);
    return details;
  } catch (error) {
    console.error("Error fetching product details", error);
    return null;
  }
}
