"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import {
  CreateProductPayload,
  CreateDishResult,
  ProductExtra,
} from "@/src/lib/partner/productTypes";

// Crear nueva sub-categoría (modal)
export async function createSubCategoryAction(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("No autenticado");

  // Obtener partner id
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nombre requerido");
  if (trimmed.length > 80) throw new Error("Nombre demasiado largo");

  // Insert simple (sin category padre por ahora)
  const { data, error } = await supabase
    .from("sub_categories")
    .insert({ name: trimmed })
    .select("id, name")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/aliado/menu/nuevo");
  return data; // { id, name }
}

// Crear producto + secciones + opciones
export async function createDishAction(
  payload: CreateProductPayload
): Promise<CreateDishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Obtener partner id
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // Insert product
  const { data: productRow, error: prodErr } = await supabase
    .from("products")
    .insert({
      name: payload.product.name,
      base_price: payload.product.basePrice,
      previous_price: payload.product.previousPrice,
      discount_percentage: payload.product.discountPercentage,
      unit: payload.product.unit,
      estimated_time: payload.product.estimatedTime,
      description: payload.product.description,
      sub_category_id: payload.product.subCategoryId,
      is_available: payload.product.isAvailable,
      tax_included: payload.product.taxIncluded,
      partner_id: partner.id,
    })
    .select("id")
    .single();
  if (prodErr || !productRow)
    throw new Error(prodErr?.message || "Error creando producto");

  const productId = productRow.id;

  if (payload.sections.length) {
    // Insert sections
    const sectionsInsert = payload.sections.map((s) => ({
      name: s.name,
      is_required: s.isRequired,
      display_order: s.order,
      product_id: productId,
    }));
    const { data: sectionsRows, error: secErr } = await supabase
      .from("product_sections")
      .insert(sectionsInsert)
      .select("id, name, display_order");
    if (secErr) throw new Error(secErr.message);

    // Map order -> section id (asumimos orden conservado)
    const orderToId = new Map<number, string>();
    sectionsRows?.forEach((r) => orderToId.set(r.display_order, r.id));

    const optionsFlatten = payload.sections.flatMap((s) =>
      s.options.map((o) => ({
        section_id: orderToId.get(s.order)!,
        extra_id: o.extraId,
        override_price: o.overridePrice,
        display_order: o.order,
      }))
    );
    if (optionsFlatten.length) {
      const { error: optErr } = await supabase
        .from("product_section_options")
        .insert(optionsFlatten);
      if (optErr) throw new Error(optErr.message);
    }
  }

  revalidatePath("/aliado/menu");
  return { productId };
}

// Stub de subida de imagen (por implementar si se requiere en este ciclo)
export async function uploadProductImageAction(
  _productId: string,
  _file: File
) {
  // TODO: Implementar subida a storage y update products.image_url
  return { imageUrl: null };
}

// Crear nuevo extra del partner
export async function createExtraAction({
  name,
  defaultPrice,
}: {
  name: string;
  defaultPrice: number;
}): Promise<ProductExtra> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nombre requerido");
  const { data, error } = await supabase
    .from("product_extras")
    .insert({
      name: trimmed,
      default_price: defaultPrice,
      partner_id: partner.id,
    })
    .select("id, name, default_price, image_url, partner_id")
    .single();
  if (error) throw new Error(error.message);
  return {
    id: data.id,
    name: data.name,
    defaultPrice: data.default_price,
    imageUrl: data.image_url,
    partnerId: data.partner_id,
  };
}
