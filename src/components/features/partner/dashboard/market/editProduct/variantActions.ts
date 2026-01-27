"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Groups ---

export async function createVariantGroup(
  productId: string,
  name: string,
  isRequired: boolean = false,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_variant_groups").insert({
    product_id: productId,
    name,
    is_required: isRequired,
    display_order: 0, // Default order, logic can be improved
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/partner/market/productos/editar/${productId}`);
}

export async function updateVariantGroup(
  groupId: string,
  productId: string,
  data: {
    name?: string;
    is_required?: boolean;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variant_groups")
    .update(data)
    .eq("id", groupId);

  if (error) throw new Error(error.message);
  revalidatePath(`/partner/market/productos/editar/${productId}`);
}

export async function deleteVariantGroup(groupId: string, productId: string) {
  const supabase = await createClient();
  // Variants with this group_id should be deleted or cascaded.
  // Assuming cascade delete is set in DB or we delete manually.
  // Start by deleting the group.
  const { error } = await supabase
    .from("product_variant_groups")
    .delete()
    .eq("id", groupId);

  if (error) throw new Error(error.message);
  revalidatePath(`/partner/market/productos/editar/${productId}`);
}

// --- Variants ---

export async function createVariant(
  productId: string,
  groupId: string,
  data: {
    name: string;
    base_price: number;
    is_available: boolean;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    group_id: groupId,
    name: data.name,
    base_price: data.base_price,
    is_available: data.is_available,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/partner/market/productos/editar/${productId}`);
}

export async function deleteVariant(variantId: string, productId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) throw new Error(error.message);
  revalidatePath(`/partner/market/productos/editar/${productId}`);
}

export async function updateVariant(
  variantId: string,
  productId: string,
  data: {
    name?: string;
    base_price?: number;
    is_available?: boolean;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .update(data)
    .eq("id", variantId);

  if (error) throw new Error(error.message);
  revalidatePath(`/partner/market/productos/editar/${productId}`);
}
