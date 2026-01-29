"use server";

import { createClient } from "@/src/lib/supabase/server";

export async function getFeaturedPartnerNames() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("name")
    .eq("is_active", true)
    .eq("is_approved", true)
    // We limit to 20 to get a nice pool, then we can shuffle client side or here
    .limit(20);

  if (!data) return [];
  
  // Shuffle array using Fisher-Yates algorithm
  const shuffled = data.map(p => p.name);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 7); // Return top 7 random names
}
