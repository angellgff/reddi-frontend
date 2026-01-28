"use server";
import { createClient } from "@/src/lib/supabase/server";

export async function searchPartners(query: string) {
  const supabase = await createClient();

  // Search partners that are active
  let dbQuery = supabase
    .from("partners")
    .select("id, name, partner_type")
    .eq("is_active", true)
    .limit(10);

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}
