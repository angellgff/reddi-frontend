import { createClient } from "@/src/lib/supabase/server";
import MarketNewProductForm from "@/src/components/features/partner/dashboard/market/newProduct/MarketNewProductForm";

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
        />
      </section>
    </div>
  );
}
