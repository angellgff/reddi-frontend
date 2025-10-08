import { createClient } from "@/src/lib/supabase/server";
import { DishData } from "@/src/lib/partner/dashboard/type";

export interface FetchDishesParams {
  q?: string | string[];
  category?: string | string[]; // sub_category_id
  tag?: string | string[]; // Placeholder (no tag column yet)
  partnerId?: string; // optional future use
}

// Maps DB row to DishData (rating/reviewCount/deliveryTime/deliveryFee are placeholders until real metrics exist)
function mapRowToDish(row: any): DishData {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url || "/tacos.svg", // fallback image
    rating: "4.8", // placeholder
    reviewCount: 0, // placeholder
    deliveryTime: row.estimated_time || "--",
    deliveryFee: "0$ tarifa de envío", // placeholder
  };
}

export default async function getRealDishesData(params: FetchDishesParams = {}) {
  const supabase = await createClient();
  let query = supabase.from("products").select(
    "id,name,image_url,estimated_time,is_available,sub_category_id"
  );

  // Text search (basic ilike on name)
  if (params.q && typeof params.q === "string" && params.q.trim()) {
    query = query.ilike("name", `%${params.q.trim()}%`);
  }

  // Category filter (sub_category_id)
  if (params.category && typeof params.category === "string" && params.category) {
    query = query.eq("sub_category_id", params.category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching products", error);
    return [] as DishData[];
  }
  return (data || []).map(mapRowToDish);
}
