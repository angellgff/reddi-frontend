"use server";

import { createClient } from "@/src/lib/supabase/server";

export async function getCoupons() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("coupons")
    .select("id, code, title")
    .eq("status", "active") // Assuming 'active' is the status for usable coupons
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }

  return data;
}
