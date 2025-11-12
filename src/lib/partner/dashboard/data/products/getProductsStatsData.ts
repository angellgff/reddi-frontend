import { ProductsStatsData } from "../../type";
import { createClient } from "@/src/lib/supabase/server";

/**
 * Devuelve estadísticas reales de productos para el partner autenticado.
 * - active_products: cantidad con is_available = true
 * - inactive_products: cantidad con is_available = false
 * - most_sold: placeholder (0) hasta tener tabla de ventas
 */
export default async function getProductsStatsData(): Promise<
  ProductsStatsData[]
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [
      { statKey: "active_products", value: "0" },
      { statKey: "most_sold", value: "0" },
      { statKey: "inactive_products", value: "0" },
    ];
  }

  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (pErr || !partner) {
    return [
      { statKey: "active_products", value: "0" },
      { statKey: "most_sold", value: "0" },
      { statKey: "inactive_products", value: "0" },
    ];
  }

  const { data, error } = await supabase
    .from("products")
    .select("id,is_available")
    .eq("partner_id", partner.id)
    .limit(5000);
  if (error) {
    console.error("getProductsStatsData: error fetching products", error);
  }
  const rows = data || [];
  const active = rows.filter((r) => r.is_available).length;
  const inactive = rows.filter((r) => !r.is_available).length;
  const mostSold = 0; // TODO: calcular a partir de tabla de ventas cuando esté disponible

  return [
    { statKey: "active_products", value: String(active) },
    { statKey: "most_sold", value: String(mostSold) },
    { statKey: "inactive_products", value: String(inactive) },
  ];
}
