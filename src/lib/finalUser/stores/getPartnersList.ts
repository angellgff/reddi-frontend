import { createClient } from "@/src/lib/supabase/server";

export async function getPartnersList() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partners")
    .select("id, name, image_url, partner_type")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Error fetching partners list:", error);
    return [];
  }

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image_url || "/images/store-placeholder.png",
    href: `/user/stores/${p.id}`,
  }));
}
