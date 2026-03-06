import { createClient } from "@/src/lib/supabase/server";
import DishFormModal from "@/src/components/features/partner/dashboard/menu/dishesList/DishFormModal";
import MarketNewProductForm from "./MarketNewProductForm";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";

interface MarketCreateProductModalServerProps {
  closeHref: string;
}

export default async function MarketCreateProductModalServer({
  closeHref,
}: MarketCreateProductModalServerProps) {
  const supabase = await createClient();

  const [categoriesResult, tagsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("product_tag_definitions")
      .select("id, name, icon_key, color")
      .eq("is_active", true)
      .order("name"),
  ]);

  const initialSubCategories = (categoriesResult.data || []).map((c) => ({
    id: c.id,
    name: c.name,
    categoryId: null as string | null,
  }));

  const availableTags: ProductTagDefinition[] = (tagsResult.data || []).map(
    (t) => ({
      id: t.id,
      name: t.name,
      iconKey: t.icon_key,
      color: t.color,
    }),
  );

  return (
    <DishFormModal title="Crear producto" closeHref={closeHref}>
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <MarketNewProductForm
          initialSubCategories={initialSubCategories}
          availableTags={availableTags}
          returnHref={closeHref}
        />
      </section>
    </DishFormModal>
  );
}
