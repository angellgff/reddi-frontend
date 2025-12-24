"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePartnerMarkup(partnerId: string, markup: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autorizado");
  }

  // Verify ownership or permission (RLS handles this usually, but good to be explicit/safe)
  const { error } = await supabase
    .from("partners")
    .update({ price_markup_percentage: markup })
    .eq("id", partnerId)
    .eq("user_id", user.id); // Ensure user owns the partner record

  if (error) {
    console.error("Error updating markup:", error);
    throw new Error("No se pudo actualizar el margen");
  }

  revalidatePath("/partner/market/dashboard");
  revalidatePath("/partner/restaurant/dashboard");
  return { success: true };
}
