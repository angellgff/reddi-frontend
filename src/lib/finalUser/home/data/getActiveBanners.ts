"use server";

import { createClient } from "@/src/lib/supabase/server";

export default async function getActiveBanners() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Fetch active banners within date range
  const { data, error } = await supabase
    .from("banners")
    .select("id, title, description, image_url, action_link")
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active banners:", error);
    return [];
  }
  console.log("Active banners fetched:", data);
  return data;
}
