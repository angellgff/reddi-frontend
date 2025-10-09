import NewDishWizard from "@/src/components/features/partner/dashboard/menu/newDish/NewDishWizard";
import { createClient } from "@/src/lib/supabase/server";

export default async function NewDishPage() {
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

  console.log("//////////////////////////////Partner ID:", partnerId);

  // Obtener SOLO las sub-categorías del partner autenticado
  let subCategories: Array<{ id: string; name: string }> = [];
  if (partnerId) {
    const { data: subCategoriesRows } = await supabase
      .from("sub_categories")
      .select("id, name, partner_id")
      .eq("partner_id", partnerId)
      .order("name");
    subCategories = (subCategoriesRows || []).map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }

  // Obtener catálogo de extras del partner
  let extras: Array<{
    id: string;
    name: string;
    default_price: number;
    image_url: string | null;
    partner_id: string;
  }> = [];
  if (partnerId) {
    const { data: extrasRows } = await supabase
      .from("product_extras")
      .select("id, name, default_price, image_url, partner_id")
      .eq("partner_id", partnerId)
      .order("name");
    extras = extrasRows || [];
  }

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <h1 className="font-semibold">Crear producto</h1>
      <section className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <NewDishWizard
          initialSubCategories={subCategories.map((c) => ({
            id: c.id,
            name: c.name,
            categoryId: null,
          }))}
          extrasCatalog={extras.map((e) => ({
            id: e.id,
            name: e.name,
            defaultPrice: e.default_price,
            imageUrl: e.image_url,
            partnerId: e.partner_id,
          }))}
        />
      </section>
    </div>
  );
}
