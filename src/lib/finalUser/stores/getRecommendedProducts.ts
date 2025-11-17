import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export type RecommendedProduct = Pick<
  ProductRow,
  | "id"
  | "name"
  | "image_url"
  | "base_price"
  | "previous_price"
  | "description"
  | "discount_percentage"
>;

/**
 * Returns products from the same partner (store), excluding the current product.
 * Limited to a small page for the carousel.
 */
export default async function getRecommendedProducts(
  partnerId: string,
  excludeProductId?: string,
  limit: number = 16
): Promise<RecommendedProduct[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, image_url, base_price, previous_price, description, discount_percentage"
    )
    .eq("partner_id", partnerId)
    .eq("is_available", true);

  if (excludeProductId) query = query.neq("id", excludeProductId);

  // Prefer recently updated items first
  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecommendedProducts error", error);
    return [];
  }
  return (data || []) as RecommendedProduct[];
}
