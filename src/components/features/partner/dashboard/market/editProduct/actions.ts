"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

const generateUniqueFileName = (originalName: string) => {
  const extension = originalName.split(".").pop() || "jpg";
  return `${crypto.randomUUID()}.${extension}`;
};

export async function updateMarketProductAction(
  productId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Autenticación requerida.");
  }

  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (pErr || !partner) {
    throw new Error("Partner no encontrado para este usuario.");
  }

  // Handle Image Upload
  let imageUrl: string | undefined = undefined;
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    const fileName = generateUniqueFileName(imageFile.name);

    // CAMBIO: Usamos user.id para cumplir con la política RLS de Supabase
    // La política dice: (storage.foldername(name))[1] = (auth.uid())::text
    const filePath = `${user.id}/${fileName}`;

    console.log("Intentando subir imagen a:", filePath);

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      console.error("Error detallado al subir imagen:", uploadError);
      throw new Error(
        `No se pudo actualizar la imagen del producto: ${uploadError.message}`,
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);
    imageUrl = publicUrl;
  }

  // Construct Payload
  // Market uses category_id based on global categories, NOT sub_category_id
  const updatePayload: Record<string, any> = {
    name: formData.get("name") as string,
    base_price: parseFloat(formData.get("basePrice") as string),
    description: formData.get("description") as string,
    unit: formData.get("unit") as string,
    measurement_unit: formData.get("measurementUnit") as string,
    min_quantity: parseFloat(formData.get("minQuantity") as string),
    quantity_step: parseFloat(formData.get("quantityStep") as string),
    estimated_time: formData.get("estimatedTimeRange") as string,
    is_available: formData.get("isAvailable") === "true",
    tax_included: formData.get("taxIncluded") === "true",
    previous_price: formData.get("previousPrice")
      ? parseFloat(formData.get("previousPrice") as string)
      : null,
    discount_percentage: formData.get("discountPercent")
      ? parseInt(formData.get("discountPercent") as string)
      : null,

    // IMPORTANT: Market logic
    category_id: formData.get("subCategoryId")
      ? (formData.get("subCategoryId") as string)
      : null,
    sub_category_id: null,
  };

  if (imageUrl) {
    updatePayload.image_url = imageUrl;
  }

  const { error: updateError } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", productId)
    .eq("partner_id", partner.id);

  if (updateError) {
    throw new Error("No se pudo guardar los cambios del producto.");
  }

  // Market products typically don't have sections/variants in this flow yet,
  // or if they do, we might need to handle them.
  // Based on the form: data.append("sections", JSON.stringify([]));
  // So we technically should clear existing sections if any, to enforce no sections.

  // Clear sections for market product just in case
  const { data: oldSections } = await supabase
    .from("product_sections")
    .select("id")
    .eq("product_id", productId);

  if (oldSections && oldSections.length > 0) {
    const oldSectionIds = oldSections.map((s) => s.id);
    await supabase
      .from("product_section_options")
      .delete()
      .in("section_id", oldSectionIds);

    await supabase
      .from("product_sections")
      .delete()
      .eq("product_id", productId);
  }

  // Handle Tags
  const tagsJson = formData.get("tags") as string;
  if (tagsJson) {
    let tagIds: string[] = [];
    try {
      tagIds = JSON.parse(tagsJson) as string[];
    } catch {}

    // Delete existing tags
    await supabase.from("product_tags").delete().eq("product_id", productId);

    // Insert new tags
    if (tagIds.length > 0) {
      const { error: tagsError } = await supabase.from("product_tags").insert(
        tagIds.map((tagId) => ({
          product_id: productId,
          tag_id: tagId,
        })),
      );
      if (tagsError) {
        console.error("Error updating tags:", tagsError);
        // Not throwing error to avoid blocking the main update if tags fail, but logging it.
      }
    }
  }

  revalidatePath("/partner/market/productos");
  revalidatePath(`/partner/market/productos/editar/${productId}`);

  return { success: true };
}
