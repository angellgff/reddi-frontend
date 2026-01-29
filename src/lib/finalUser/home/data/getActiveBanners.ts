"use server";

import { createClient } from "@/src/lib/supabase/server";
import { Database } from "@/src/lib/database.types";

export default async function getActiveBanners(
  placement?: Database["public"]["Enums"]["banner_placement"],
) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  let query = supabase
    .from("banners")
    .select("id, title, description, image_url, action_link")
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("created_at", { ascending: false });

  if (placement) {
    query = query.eq("placement", placement);
  }

  // Fetch active banners within date range
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching active banners:", error);
    return [];
  }
  console.log("Active banners fetched:", data);
  return data;
}
