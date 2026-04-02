"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

type CreateMarketProductResult = { productId: string };

// Helper para generar un nombre de archivo único y seguro
const generateUniqueFileName = (originalName: string) => {
  const extension = originalName.split(".").pop() || "jpg";
  return `${crypto.randomUUID()}.${extension}`;
};

const normalizeSearchKeywords = (keywords: string[]) => {
  return Array.from(
    new Set(
      keywords.map((keyword) => keyword.trim().toLowerCase()).filter(Boolean),
    ),
  );
};

const parseSearchKeywordsFromFormData = (formData: FormData) => {
  const raw = formData.get("search_keywords");
  if (typeof raw !== "string" || !raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return normalizeSearchKeywords(
      parsed.filter((item) => typeof item === "string"),
    );
  } catch {
    return [];
  }
};

const parseSelectedCategoryIdsFromFormData = (formData: FormData): string[] => {
  const rawIds = formData.get("subCategoryIds");
  if (typeof rawIds === "string" && rawIds) {
    try {
      const parsed = JSON.parse(rawIds);
      if (Array.isArray(parsed)) {
        return Array.from(
          new Set(parsed.filter((item) => typeof item === "string" && item)),
        );
      }
    } catch {
      // fallback
    }
  }

  const legacy = formData.get("subCategoryId");
  return typeof legacy === "string" && legacy ? [legacy] : [];
};

const syncProductCategories = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  categoryIds: string[],
) => {
  const uniqueIds = Array.from(new Set(categoryIds.filter(Boolean)));

  const { error: deleteError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    throw new Error(
      deleteError.message || "No se pudieron limpiar las categorías previas",
    );
  }

  if (uniqueIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("product_categories")
    .insert(
      uniqueIds.map((categoryId) => ({
        product_id: productId,
        category_id: categoryId,
      })),
    );

  if (insertError) {
    throw new Error(insertError.message || "No se pudieron guardar categorías");
  }
};

/**
 * Crea un producto para Market (sin extras/secciones)
 * Sube imagen a Supabase Storage y guarda URL pública en products.image_url
 */
export async function createMarketProductAction(
  formData: FormData,
): Promise<CreateMarketProductResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Obtener partner_id
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) throw new Error("Partner no encontrado");

  // Subida de imagen (opcional)
  let imageUrl: string | null = null;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const fileName = generateUniqueFileName(imageFile.name);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(`public/${fileName}`, imageFile);
    if (uploadError) throw new Error("Error al subir la imagen del producto.");
    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(uploadData.path);
    imageUrl = publicUrlData.publicUrl;
  }

  // Payload del producto
  const searchKeywords = parseSearchKeywordsFromFormData(formData);
  const selectedCategoryIds = parseSelectedCategoryIdsFromFormData(formData);
  if (selectedCategoryIds.length === 0) {
    throw new Error("Debe seleccionar al menos una categoría");
  }

  const productPayload = {
    name: formData.get("name") as string,
    base_price: parseFloat(formData.get("basePrice") as string),
    previous_price: formData.get("previousPrice")
      ? parseFloat(formData.get("previousPrice") as string)
      : null,
    unit: formData.get("unit") as string,
    measurement_unit: formData.get("measurementUnit") as string,
    min_quantity: parseFloat(formData.get("minQuantity") as string),
    quantity_step: parseFloat(formData.get("quantityStep") as string),
    estimated_time: formData.get("estimatedTimeRange") as string,
    description: formData.get("description") as string,
    is_available: formData.get("isAvailable") === "true",
    tax_included: formData.get("taxIncluded") === "true",
    search_keywords: searchKeywords,
    partner_id: partner.id,
    image_url: imageUrl,
  };

  // Insert en products
  const { data: productRow, error: prodErr } = await supabase
    .from("products")
    .insert(productPayload)
    .select("id")
    .single();
  if (prodErr || !productRow)
    throw new Error(prodErr?.message || "Error creando producto");

  await syncProductCategories(supabase, productRow.id, selectedCategoryIds);

  // Insert Tags
  const tagsJson = formData.get("tags") as string;
  console.log("Action Received Tags JSON:", tagsJson);

  if (tagsJson) {
    let tagIds: string[] = [];
    try {
      tagIds = JSON.parse(tagsJson) as string[];
    } catch (e) {
      console.error("Error parsing tags JSON:", e);
    }

    console.log("Parsed Tag IDs to insert:", tagIds);

    if (tagIds.length > 0) {
      const { error: tagsError } = await supabase.from("product_tags").insert(
        tagIds.map((tagId) => ({
          product_id: productRow.id,
          tag_id: tagId,
        })),
      );
      if (tagsError) {
        console.error("Error creating tags:", tagsError);
        throw new Error(`Error guardando etiquetas: ${tagsError.message}`);
      } else {
        console.log("Tags inserted successfully.");
      }
    } else {
      console.log("No tags to insert (empty list).");
    }
  } else {
    console.log("No tags field in formData.");
  }

  // Revalidar vistas relevantes de Market
  revalidatePath("/partner/market/productos");
  revalidatePath("/partner/market/productos/nuevo");

  return { productId: productRow.id };
}
