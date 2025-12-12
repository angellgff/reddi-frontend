"use server";

import { createClient } from "@/src/lib/supabase/server";

export async function getBannerCategories() {
  const supabase = await createClient();

  // Assuming 'categories' table has generic categories. 
  // If there is a specific Type enum or table for banners, use that.
  // Based on database.types.ts, there is a 'categories' table.
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}
