"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();

  // 1) Autenticación
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // 2) Obtener partner vinculado al usuario
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // 3) Validar ownership
  const { data: productRow, error: fetchErr } = await supabase
    .from("products")
    .select("id, partner_id")
    .eq("id", productId)
    .single();
  
  if (fetchErr || !productRow)
    throw new Error(fetchErr?.message || "Producto no encontrado");
  if (productRow.partner_id !== partner.id)
    throw new Error("No autorizado para eliminar este producto");

  // 4) Soft Delete: Set is_available = false
  const { error: updateErr } = await supabase
    .from("products")
    .update({ is_available: false })
    .eq("id", productId);

  if (updateErr)
    throw new Error(`Error inhabilitando producto: ${updateErr.message}`);

  // 5) Revalidar listado
  revalidatePath("/partner/market/productos");

  return { success: true };
}

export async function restoreProductAction(productId: string) {
  const supabase = await createClient();

  // 1) Autenticación
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // 2) Obtener partner
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // 3) Validar ownership
  const { data: productRow, error: fetchErr } = await supabase
    .from("products")
    .select("id, partner_id")
    .eq("id", productId)
    .single();
  
  if (fetchErr || !productRow)
    throw new Error(fetchErr?.message || "Producto no encontrado");
  if (productRow.partner_id !== partner.id)
    throw new Error("No autorizado para restaurar este producto");

  // 4) Restore: Set is_available = true
  const { error: updateErr } = await supabase
    .from("products")
    .update({ is_available: true })
    .eq("id", productId);

  if (updateErr)
    throw new Error(`Error restaurando producto: ${updateErr.message}`);

  // 5) Revalidar
  revalidatePath("/partner/market/productos");

  return { success: true };
}
