"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

export interface PartnerCategory {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  displayOrder: number;
  productCount: number;
}

/**
 * Get all categories for the authenticated partner
 */
export async function getPartnerCategories(): Promise<PartnerCategory[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // Get partner id
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // Get categories with product count
  const { data: categories, error: catErr } = await supabase
    .from("sub_categories")
    .select("id, name, image_url, created_at, display_order")
    .eq("partner_id", partner.id)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (catErr) throw new Error(catErr.message);

  // Get product counts per category
  const categoryIds = (categories || []).map((c) => c.id);
  const { data: products } = await supabase
    .from("product_sub_categories")
    .select("sub_category_id")
    .in("sub_category_id", categoryIds);

  const countMap: Record<string, number> = {};
  (products || []).forEach((p) => {
    if (p.sub_category_id) {
      countMap[p.sub_category_id] = (countMap[p.sub_category_id] || 0) + 1;
    }
  });

  return (categories || []).map((c) => ({
    id: c.id,
    name: c.name,
    imageUrl: c.image_url,
    createdAt: c.created_at,
    displayOrder: c.display_order,
    productCount: countMap[c.id] || 0,
  }));
}

/**
 * Create a new category for the authenticated partner
 */
export async function createCategoryAction(
  name: string,
  imageUrl?: string | null,
): Promise<{ id: string; name: string; displayOrder: number }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // Get partner id
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nombre requerido");
  if (trimmed.length > 80)
    throw new Error("Nombre demasiado largo (máx 80 caracteres)");

  // Check for duplicate name
  const { data: existing } = await supabase
    .from("sub_categories")
    .select("id")
    .eq("partner_id", partner.id)
    .ilike("name", trimmed)
    .maybeSingle();

  if (existing) throw new Error("Ya existe una categoría con ese nombre");

  const { data, error } = await supabase
    .from("sub_categories")
    .insert({
      name: trimmed,
      partner_id: partner.id,
      image_url: imageUrl || null,
    })
    .select("id, name, display_order")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/partner/restaurant/categorias");
  revalidatePath("/partner/restaurant/menu");
  return {
    id: data.id,
    name: data.name,
    displayOrder: data.display_order,
  };
}

/**
 * Update an existing category
 */
export async function updateCategoryAction(
  id: string,
  name: string,
  imageUrl?: string | null,
): Promise<{ id: string; name: string; displayOrder: number }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // Get partner id
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nombre requerido");
  if (trimmed.length > 80)
    throw new Error("Nombre demasiado largo (máx 80 caracteres)");

  // Check category belongs to partner
  const { data: cat } = await supabase
    .from("sub_categories")
    .select("id, partner_id")
    .eq("id", id)
    .single();

  if (!cat || cat.partner_id !== partner.id) {
    throw new Error("Categoría no encontrada");
  }

  // Check for duplicate name (excluding current)
  const { data: existing } = await supabase
    .from("sub_categories")
    .select("id")
    .eq("partner_id", partner.id)
    .ilike("name", trimmed)
    .neq("id", id)
    .maybeSingle();

  if (existing) throw new Error("Ya existe otra categoría con ese nombre");

  const { data, error } = await supabase
    .from("sub_categories")
    .update({
      name: trimmed,
      image_url: imageUrl ?? null,
    })
    .eq("id", id)
    .select("id, name, display_order")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/partner/restaurant/categorias");
  revalidatePath("/partner/restaurant/menu");
  return {
    id: data.id,
    name: data.name,
    displayOrder: data.display_order,
  };
}

/**
 * Reorder partner categories for the authenticated partner
 */
export async function reorderCategoriesAction(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Orden inválido");
  }

  const hasInvalid = items.some(
    (item) =>
      !item.id || !Number.isInteger(item.displayOrder) || item.displayOrder < 1,
  );
  if (hasInvalid) throw new Error("Orden inválido");

  const uniqueIds = new Set(items.map((item) => item.id));
  const uniqueOrders = new Set(items.map((item) => item.displayOrder));
  if (uniqueIds.size !== items.length || uniqueOrders.size !== items.length) {
    throw new Error("Orden inválido");
  }

  const rpcItems = items.map((item) => ({
    id: item.id,
    display_order: item.displayOrder,
  }));

  const { error } = await supabase.rpc("reorder_partner_sub_categories", {
    p_partner_id: partner.id,
    p_items: rpcItems,
  });

  if (error) throw new Error(error.message || "No se pudo reordenar");

  revalidatePath("/partner/restaurant/categorias");
  revalidatePath("/partner/restaurant/menu");
}

/**
 * Delete a category (only if no products are associated)
 */
export async function deleteCategoryAction(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // Get partner id
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // Check category belongs to partner
  const { data: cat } = await supabase
    .from("sub_categories")
    .select("id, partner_id")
    .eq("id", id)
    .single();

  if (!cat || cat.partner_id !== partner.id) {
    throw new Error("Categoría no encontrada");
  }

  // Check for associated products
  const { count } = await supabase
    .from("product_sub_categories")
    .select("product_id", { count: "exact", head: true })
    .eq("sub_category_id", id);

  if (count && count > 0) {
    throw new Error(
      `No se puede eliminar: hay ${count} producto(s) asociado(s) a esta categoría`,
    );
  }

  const { error } = await supabase.from("sub_categories").delete().eq("id", id);

  if (error) throw new Error(error.message);

  const { error: normalizeError } = await supabase.rpc(
    "normalize_partner_sub_category_order",
    {
      p_partner_id: partner.id,
    },
  );
  if (normalizeError) {
    throw new Error(normalizeError.message || "No se pudo normalizar el orden");
  }

  revalidatePath("/partner/restaurant/categorias");
  revalidatePath("/partner/restaurant/menu");
}
