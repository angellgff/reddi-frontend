import { createClient } from "@/src/lib/supabase/server";

export interface SubCategoryOption {
  value: string;
  label: string;
}

export default async function getSubCategories(
  partnerId: string
): Promise<SubCategoryOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sub_categories")
    .select("id,name")
    .eq("partner_id", partnerId) // Only sub-categories for the specific partner
    .order("name", { ascending: true });
  if (error) {
    console.error("Error fetching sub_categories", error);
    return [];
  }
  return (data || []).map((sc) => ({ value: sc.id, label: sc.name }));
}
