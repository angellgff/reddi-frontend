"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import {
  CreateProductPayload,
  CreateDishResult,
  ProductExtra,
  ProductSectionForm,
} from "@/src/lib/partner/productTypes";

// Helper para generar un nombre de archivo único y seguro
const generateUniqueFileName = (originalName: string) => {
  const extension = originalName.split(".").pop() || "jpg";
  return `${crypto.randomUUID()}.${extension}`;
};

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
  formData: FormData
): Promise<CreateDishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // 1. Obtener partner_id (sin cambios)
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // 2. Manejar la subida de la imagen a Supabase Storage
  let imageUrl: string | null = null;
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    const fileName = generateUniqueFileName(imageFile.name);
    // Sube al bucket 'product-images'. ¡Asegúrate de que este bucket exista y sea público!
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(`public/${fileName}`, imageFile);

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      throw new Error("Error al subir la imagen del producto.");
    }

    // Obtenemos la URL pública para guardarla en la base de datos
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploadData.path);

    imageUrl = publicUrlData.publicUrl;
  }

  // 3. Extraer los datos del producto del FormData
  const productPayload = {
    name: formData.get("name") as string,
    base_price: parseFloat(formData.get("basePrice") as string),
    previous_price: formData.get("previousPrice")
      ? parseFloat(formData.get("previousPrice") as string)
      : null,
    // Asumo que discountPercent se calcula en el cliente o aquí. Lo añadiré por si acaso.
    // discount_percentage: formData.get("discountPercent") ? parseInt(formData.get("discountPercent") as string, 10) : null,
    unit: formData.get("unit") as string,
    // Cambia estimatedTime a estimated_time si así se llama en tu DB
    estimated_time: formData.get("estimatedTimeRange") as string,
    description: formData.get("description") as string,
    sub_category_id: formData.get("subCategoryId") as string,
    is_available: formData.get("isAvailable") === "true",
    tax_included: formData.get("taxIncluded") === "true",
    partner_id: partner.id,
    image_url: imageUrl, // <-- ¡Aquí está la URL de la imagen!
  };

  // 4. Insertar el producto en la tabla 'products'
  const { data: productRow, error: prodErr } = await supabase
    .from("products")
    .insert(productPayload)
    .select("id")
    .single();

  if (prodErr || !productRow)
    throw new Error(prodErr?.message || "Error creando producto");

  const productId = productRow.id;

  // 5. Extraer y procesar las secciones y opciones (sin cambios en la lógica, solo en la fuente de datos)
  const sections: ProductSectionForm[] = JSON.parse(
    formData.get("sections") as string
  );

  if (sections.length) {
    // Insert sections
    const sectionsInsert = sections.map((s, index) => ({
      name: s.name,
      is_required: s.isRequired,
      display_order: index,
      product_id: productId,
    }));
    const { data: sectionsRows, error: secErr } = await supabase
      .from("product_sections")
      .insert(sectionsInsert)
      .select("id, name, display_order");
    if (secErr) throw new Error(secErr.message);

    // ... (El resto de la lógica para las opciones es idéntica)
    const orderToId = new Map<number, string>();
    sectionsRows?.forEach((r) => orderToId.set(r.display_order, r.id));

    const optionsFlatten = sections.flatMap((s, sectionIndex) =>
      s.options
        .filter((o) => o.extraId)
        .map((o, optionIndex) => ({
          section_id: orderToId.get(sectionIndex)!,
          extra_id: o.extraId!,
          // VERSIÓN CORREGIDA Y MÁS SEGURA
          override_price:
            o.overridePrice && o.overridePrice.trim() !== ""
              ? parseFloat(o.overridePrice)
              : null,
          display_order: optionIndex,
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
  imageFile,
}: {
  name: string;
  defaultPrice: number;
  imageFile?: File | null;
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

  // Subida opcional de imagen del extra
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const fileName = generateUniqueFileName(imageFile.name);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(`public/extras/${fileName}`, imageFile);
    if (uploadError) {
      console.error("Supabase Storage Error (extra):", uploadError);
      throw new Error("Error al subir la imagen del extra.");
    }
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploadData.path);
    imageUrl = publicUrlData.publicUrl;
  }
  const { data, error } = await supabase
    .from("product_extras")
    .insert({
      name: trimmed,
      default_price: defaultPrice,
      partner_id: partner.id,
      image_url: imageUrl,
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
