import { ProductData } from "@/src/lib/partner/dashboard/type";
import { createClient } from "@/src/lib/supabase/server";

export interface FetchProductsParams {
  q?: string | string[];
  category?: string | string[]; // sub_category_id
  isAvailable?: string | string[];
}

/**
 * Obtiene los productos REALES del partner autenticado.
 * Fallback: si no hay sesión o partner devuelve [] para evitar errores en SSR.
 * NOTE: Se asume moneda "DoP" ya que el esquema no define currency. Ajusta si existe columna.
 */
export default async function getProductsData(
  params: FetchProductsParams = {},
): Promise<ProductData[]> {
  const supabase = await createClient();

  // 1. Usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // 2. Partner
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (pErr || !partner) return [];

  // 3. Productos del partner
  let query = supabase
    .from("products")
    .select(
      "id,name,description,base_price,previous_price,image_url,is_available,product_categories(category_id),product_sub_categories(sub_category_id)",
    )
    .eq("partner_id", partner.id);

  // Filtro de búsqueda por texto
  if (params.q && typeof params.q === "string" && params.q.trim()) {
    const q = params.q.trim();
    // Búsqueda en nombre O descripción (usando OR)
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // Filtro de disponibilidad
  const availabilityParam = Array.isArray(params.isAvailable)
    ? params.isAvailable[0]
    : params.isAvailable;

  if (availabilityParam === "false") {
    query = query.eq("is_available", false);
  } else if (availabilityParam === "all") {
    // No filter applied for 'all'
  } else {
    // Default or explicitly 'true'
    query = query.eq("is_available", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getProductsData: error fetching products", error);
    return [];
  }

  const selectedCategory =
    params.category && typeof params.category === "string"
      ? params.category
      : undefined;

  const filteredData = selectedCategory
    ? (data || []).filter((row) => {
        const categoryIds = (row.product_categories || []).map(
          (item) => item.category_id,
        );
        const subCategoryIds = (row.product_sub_categories || []).map(
          (item) => item.sub_category_id,
        );
        return (
          categoryIds.includes(selectedCategory) ||
          subCategoryIds.includes(selectedCategory)
        );
      })
    : data || [];

  // 4. Mapear al tipo esperado por el frontend
  return filteredData.map(
    (row): ProductData => ({
      id: row.id,
      name: row.name || "Sin nombre",
      description: row.description || "",
      price: typeof row.base_price === "number" ? row.base_price : 0,
      currency: "DOP", // Assumption
      imageUrl: row.image_url || "/placeholder-product.svg",
      categoryId:
        (row.product_sub_categories || [])[0]?.sub_category_id ||
        (row.product_categories || [])[0]?.category_id ||
        null,
      isAvailable: row.is_available,
    }),
  );
}
