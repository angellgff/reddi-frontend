"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateMarkupSchema = z.object({
  partnerId: z.string().uuid("Identificador de aliado inválido"),
  markup: z.number().finite().min(0).max(300),
});

export async function updatePartnerMarkup(partnerId: string, markup: number) {
  const parsed = updateMarkupSchema.safeParse({ partnerId, markup });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Datos inválidos");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autorizado");
  }

  const { data: ownedPartner, error: ownershipError } = await supabase
    .from("partners")
    .select("id")
    .eq("id", parsed.data.partnerId)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (ownershipError || !ownedPartner?.id) {
    throw new Error("No autorizado para modificar este aliado");
  }

  const { error } = await supabase
    .from("partners")
    .update({ price_markup_percentage: parsed.data.markup })
    .eq("id", ownedPartner.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating markup:", error);
    throw new Error("No se pudo actualizar el margen");
  }

  revalidatePath("/partner/market/dashboard");
  revalidatePath("/partner/restaurant/dashboard");
  return { success: true };
}
