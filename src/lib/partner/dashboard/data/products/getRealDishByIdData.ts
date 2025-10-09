import { createClient } from "@/src/lib/supabase/server";
import { CreateProductFormState } from "@/src/lib/partner/productTypes"; // ¡Importante! Usamos el tipo unificado.
import { cache } from "react";
import { randomUUID } from "crypto"; // Para generar IDs únicos para el formulario

/**
 * Mapea una fila de la tabla 'products' de Supabase (con sus secciones y opciones anidadas)
 * al estado del formulario 'CreateProductFormState'.
 * @param product - El objeto completo del producto con sus relaciones.
 * @returns Un objeto con el formato CreateProductFormState.
 */
function mapProductToFormState(product: any): CreateProductFormState {
  return {
    // Campos principales del producto
    image: product.image_url || null, // El formulario manejará File | string | null
    name: product.name || "",
    basePrice: String(product.base_price || "0"),
    previousPrice: String(product.previous_price || ""),
    discountPercent: String(product.discount_percent || ""), // Asegúrate que el nombre de columna coincida
    unit: product.unit || "",
    estimatedTimeRange: product.estimated_time || "",
    description: product.description || "",
    subCategoryId: product.sub_category_id || null,
    isAvailable: product.is_available ?? true,
    taxIncluded: product.tax_included ?? false,

    // Mapeo de secciones y opciones anidadas
    sections: (product.product_sections || []).map((section: any) => ({
      clientId: randomUUID(), // ID para el estado del cliente
      id: section.id, // ID de la base de datos
      name: section.name,
      isRequired: section.is_required,
      allowMultiple: section.allow_multiple,
      options: (section.product_options || []).map((option: any) => ({
        clientId: randomUUID(), // ID para el estado del cliente
        id: option.id, // ID de la base de datos
        extraId: option.extra_id,
        price: String(option.price),
      })),
    })),
  };
}

/**
 * Función (sin caché) para obtener un producto específico por su ID,
 * incluyendo todas sus secciones y opciones asociadas.
 * Verifica que el producto pertenezca al partner_id del usuario autenticado.
 */
async function getDishByIdUncached({
  id,
}: {
  id: string;
}): Promise<CreateProductFormState> {
  console.log(`Fetching real product data for ID: ${id}`);

  const supabase = await createClient();

  // 1. Obtener el usuario y su partner_id para seguridad
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile?.id) throw new Error("User is not associated with a partner.");

  // 2. Hacer la petición a la tabla 'products' con datos anidados
  // Esta es la forma eficiente de obtener el producto y todas sus relaciones en una sola consulta.
  const { data, error } = await supabase
    .from("products")
    .select(
      `
    *,
    sub_categories(*),
    product_sections (
      *,
      product_section_options (*)
    )
  `
    )
    .eq("id", id)
    .single();

  // 3. Manejar errores
  if (error || !data) {
    console.error(
      "Error fetching product or product not found:",
      error?.message
    );
    throw new Error(
      "Product not found or you do not have permission to view it."
    );
  }

  // 4. Mapear y devolver los datos en el formato que el frontend espera
  return mapProductToFormState(data);
}

// 5. Exportar la versión en caché
export const getRealDishById = cache(getDishByIdUncached);
