import { createClient } from "@/src/lib/supabase/server";

export async function getPartnerDataForProductForms() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  const partnerId = partner?.id;
  if (!partnerId) return null;

  const { data: subCategoriesData } = await supabase
    .from("sub_categories")
    .select("id, name")
    .eq("partner_id", partnerId)
    .order("name");

  const { data: extrasData } = await supabase
    .from("product_extras")
    .select("id, name, default_price, image_url, partner_id")
    .eq("partner_id", partnerId)
    .order("name");

  return {
    subCategories: (subCategoriesData || []).map((c) => ({
      id: c.id,
      name: c.name,
      categoryId: null, // Ajusta si tienes categorías padre
    })),
    extras: (extrasData || []).map((e) => ({
      id: e.id,
      name: e.name,
      defaultPrice: e.default_price,
      imageUrl: e.image_url,
      partnerId: e.partner_id,
    })),
  };
}
