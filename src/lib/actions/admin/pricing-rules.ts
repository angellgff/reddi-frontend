"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPricingRule(formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const base_fee = Number(formData.get("base_fee") || 0);
  const fee_per_kilometer = Number(formData.get("fee_per_kilometer") || 0);
  const min_fee = formData.get("min_fee") ? Number(formData.get("min_fee")) : null;
  const max_fee = formData.get("max_fee") ? Number(formData.get("max_fee")) : null;
  const is_active_val = formData.get("is_active");
  // Checkbox or select: if checkbox is unchecked it might be null. 
  // If select "true"/"false" strings, parse them.
  // I will assume a select or checkbox returning "on" or "true".
  const is_active = is_active_val === "true" || is_active_val === "on";

  if (!name) {
    // return { error: "El nombre es obligatorio" };
    return;
  }

  const { error } = await supabase.from("delivery_pricing_rules").insert({
    name,
    base_fee,
    fee_per_kilometer,
    min_fee,
    max_fee,
    is_active,
  });

  if (error) {
    console.error("Create pricing rule error:", error);
    // return { error: error.message }; 
    return;
  }

  revalidatePath("/admin/pricing-rules");
  redirect("/admin/pricing-rules");
}

export async function updatePricingRule(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const base_fee = Number(formData.get("base_fee") || 0);
  const fee_per_kilometer = Number(formData.get("fee_per_kilometer") || 0);
  const min_fee = formData.get("min_fee") ? Number(formData.get("min_fee")) : null;
  const max_fee = formData.get("max_fee") ? Number(formData.get("max_fee")) : null;
  const is_active_val = formData.get("is_active");
  const is_active = is_active_val === "true" || is_active_val === "on";

  if (!name) return; // Silent fail or log

  const { error } = await supabase
    .from("delivery_pricing_rules")
    .update({
      name,
      base_fee,
      fee_per_kilometer,
      min_fee,
      max_fee,
      is_active,
    })
    .eq("id", id);

  if (error) {
     console.error("Update error:", error);
     return;
  }

  revalidatePath("/admin/pricing-rules");
  redirect("/admin/pricing-rules");
}

export async function deletePricingRule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("delivery_pricing_rules").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/pricing-rules");
}
