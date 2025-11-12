"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";

type CreateMarketProductResult = { productId: string };

// Helper para generar un nombre de archivo único y seguro
const generateUniqueFileName = (originalName: string) => {
  const extension = originalName.split(".").pop() || "jpg";
  return `${crypto.randomUUID()}.${extension}`;
};

/**
 * Crea un producto para Market (sin extras/secciones)
 * Sube imagen a Supabase Storage y guarda URL pública en products.image_url
 */
export async function createMarketProductAction(
  formData: FormData
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
  const productPayload = {
    name: formData.get("name") as string,
    base_price: parseFloat(formData.get("basePrice") as string),
    previous_price: formData.get("previousPrice")
      ? parseFloat(formData.get("previousPrice") as string)
      : null,
    unit: formData.get("unit") as string,
    estimated_time: formData.get("estimatedTimeRange") as string,
    description: formData.get("description") as string,
    sub_category_id: formData.get("subCategoryId") as string,
    is_available: formData.get("isAvailable") === "true",
    tax_included: formData.get("taxIncluded") === "true",
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

  // Revalidar vistas relevantes de Market
  revalidatePath("/partner/market/productos");
  revalidatePath("/partner/market/productos/nuevo");

  return { productId: productRow.id };
}
