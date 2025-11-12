import { ProductData } from "@/src/lib/partner/dashboard/type";
import { createClient } from "@/src/lib/supabase/server";

/**
 * Obtiene los productos REALES del partner autenticado.
 * Fallback: si no hay sesión o partner devuelve [] para evitar errores en SSR.
 * NOTE: Se asume moneda "COP" ya que el esquema no define currency. Ajusta si existe columna.
 */
export default async function getProductsData(): Promise<ProductData[]> {
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
    .single();
  if (pErr || !partner) return [];

  // 3. Productos del partner (limit de seguridad)
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,description,base_price,previous_price,image_url,is_available,sub_category_id"
    )
    .eq("partner_id", partner.id)
    .limit(1000);

  if (error) {
    console.error("getProductsData: error fetching products", error);
    return [];
  }

  // 4. Mapear al tipo esperado por el frontend
  return (data || []).map(
    (row): ProductData => ({
      id: row.id,
      name: row.name || "Sin nombre",
      description: row.description || "",
      price: typeof row.base_price === "number" ? row.base_price : 0,
      currency: "COP", // Assumption
      imageUrl: row.image_url || "/placeholder-product.svg",
    })
  );
}
