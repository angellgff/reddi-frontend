import { createClient } from "@/src/lib/supabase/server";
import { Database } from "@/src/lib/database.types";

type AppSectionKey = Database["public"]["Enums"]["app_section_key"];

export async function getPlacements(sectionKey?: AppSectionKey) {
  const supabase = await createClient();

  let query = supabase
    .from("partner_placements")
    .select(
      `
      *,
      partner:partners(
        id,
        name,
        image_url,
        partner_type,
        is_active
      )
    `,
    )
    .order("section_key")
    .order("display_order", { ascending: true });

  if (sectionKey) {
    query = query.eq("section_key", sectionKey);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching placements:", error);
    throw new Error("Failed to fetch placements");
  }

  return data;
}
