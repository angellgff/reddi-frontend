import { createClient } from "@/src/lib/supabase/server";
import {
  CreateProductFormState,
  ProductSectionForm,
  SectionExtraSelection,
} from "@/src/lib/partner/productTypes";
import { cache } from "react";
import { randomUUID } from "crypto";
import { notFound } from "next/navigation";

/**
 * Mapea la estructura de datos compleja de Supabase al estado del formulario.
 * ¡CORREGIDO Y MEJORADO!
 */
function mapProductToFormState(product: any): CreateProductFormState {
  return {
    // Campos principales del producto
    image: product.image_url || null,
    name: product.name || "",
    basePrice: String(product.base_price || "0"),
    previousPrice: String(product.previous_price || ""),
    discountPercent: String(product.discount_percentage || ""), // Asegúrate de que esta columna exista
    unit: product.unit || "",
    estimatedTimeRange: product.estimated_time || "",
    description: product.description || "",
    subCategoryId: product.sub_category_id || null,
    isAvailable: product.is_available ?? true,
    taxIncluded: product.tax_included ?? false,

    // Mapeo corregido de secciones y opciones anidadas
    sections: (product.product_sections || []).map(
      (section: any): ProductSectionForm => ({
        clientId: randomUUID(),
        id: section.id,
        name: section.name,
        isRequired: section.is_required,
        // Nota: Tu mapeo incluía 'allowMultiple', pero no está en el esquema.
        // Si la necesitas, deberás añadirla a la tabla 'product_sections'.
        options: (section.product_section_options || []).map(
          (option: any): SectionExtraSelection => {
            // La consulta ahora incluye los detalles del extra
            const extraDetails = option.product_extras;
            return {
              clientId: randomUUID(),
              id: option.id,
              extraId: option.extra_id,
              // CORRECCIÓN: El campo es 'override_price'
              overridePrice: String(option.override_price || ""),

              // Datos adicionales del extra que puedes necesitar en el frontend (opcional)
              // extraName: extraDetails?.name || 'Extra no encontrado',
              // extraDefaultPrice: extraDetails?.default_price || 0,
            };
          }
        ),
      })
    ),
  };
}

/**
 * Función (sin caché) para obtener un producto específico por su ID.
 * ¡CORREGIDA Y MEJORADA!
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

  // CORRECCIÓN DE SEGURIDAD: Obtenemos el partner_id directamente
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (partnerError || !partner)
    throw new Error("User is not associated with a partner.");

  // 2. CORRECCIÓN: La consulta ahora es más completa y segura
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_sections (
        *,
        product_section_options (
          *,
          product_extras (*)
        )
      )
    `
    )
    .eq("id", id)
    .eq("partner_id", partner.id) // ¡FILTRO DE SEGURIDAD AÑADIDO!
    .single();

  // 3. Manejo de errores
  if (error) {
    console.error("Error fetching product:", error.message);
    // Si el error indica que no se encontraron filas, es un 404
    if (error.code === "PGRST116") {
      notFound();
    }
    throw new Error(
      "Product not found or you do not have permission to view it."
    );
  }

  if (!data) {
    notFound();
  }

  // 4. Mapear y devolver los datos en el formato que el frontend espera
  return mapProductToFormState(data);
}

// 5. Exportar la versión en caché (sin cambios)
export const getRealDishById = cache(getDishByIdUncached);
