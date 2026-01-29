import { createClient } from "@/src/lib/supabase/server";

export async function getBannerById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching banner by ID:", error);
    return null;
  }

  return data;
}
