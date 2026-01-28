import { createClient } from "@/src/lib/supabase/server";
import MarketNewProductForm from "@/src/components/features/partner/dashboard/market/newProduct/MarketNewProductForm";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let partnerId: string | null = null;
  if (user) {
    const { data: partner } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();
    partnerId = partner?.id || null;
  }

  // Obtener SOLO las categorías globales (tabla 'categories')
  let subCategories: Array<{ id: string; name: string }> = [];
  if (partnerId) {
    const { data: categoriesRows } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    subCategories = (categoriesRows || []).map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }

  // Fetch Tags Definitions
  const { data: tagDefinitions } = await supabase
    .from("product_tag_definitions")
    .select("id, name, icon_key, color")
    .eq("is_active", true)
    .order("name");

  const availableTags: ProductTagDefinition[] = (tagDefinitions || []).map(
    (t) => ({
      id: t.id,
      name: t.name,
      iconKey: t.icon_key,
      color: t.color,
    }),
  );

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <h1 className="font-semibold">Crear producto</h1>
      <section className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <MarketNewProductForm
          initialSubCategories={subCategories.map((c) => ({
            id: c.id,
            name: c.name,
            categoryId: null,
          }))}
          availableTags={availableTags}
        />
      </section>
    </div>
  );
}
