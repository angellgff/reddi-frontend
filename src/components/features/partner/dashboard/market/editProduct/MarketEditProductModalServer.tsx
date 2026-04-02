import { createClient } from "@/src/lib/supabase/server";
import DishFormModal from "@/src/components/features/partner/dashboard/menu/dishesList/DishFormModal";
import MarketEditProductForm from "./MarketEditProductForm";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";
import ProductVariantsManager from "@/src/components/features/partner/dashboard/shared/ProductVariantsManager";

interface MarketEditProductModalServerProps {
  id: string;
  closeHref: string;
}

export default async function MarketEditProductModalServer({
  id,
  closeHref,
}: MarketEditProductModalServerProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!partner) return null;

  const [
    productResult,
    groupsResult,
    tagsResult,
    productTagsResult,
    categoriesResult,
    productCategoriesResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, description, base_price, previous_price, unit, measurement_unit, min_quantity, quantity_step, estimated_time, search_keywords, is_available, tax_included, image_url",
      )
      .eq("id", id)
      .eq("partner_id", partner.id)
      .single(),
    supabase
      .from("product_variant_groups")
      .select(
        `
          id,
          name,
          is_required,
          product_variants (
            id,
            name,
            base_price,
            is_available,
            group_id
          )
        `,
      )
      .eq("product_id", id)
      .order("display_order", { ascending: true }),
    supabase
      .from("product_tag_definitions")
      .select("id, name, icon_key, color")
      .eq("is_active", true)
      .order("name"),
    supabase.from("product_tags").select("tag_id").eq("product_id", id),
    supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", id),
  ]);

  const productRow = productResult.data;
  if (productResult.error || !productRow) return null;

  const formattedGroups = (groupsResult.data || []).map((g) => ({
    id: g.id,
    name: g.name,
    is_required: g.is_required,
    product_variants: (g.product_variants as any[]).map((v) => ({
      id: v.id,
      name: v.name,
      base_price: v.base_price,
      is_available: v.is_available,
      group_id: v.group_id,
    })),
  }));

  const availableTags: ProductTagDefinition[] = (tagsResult.data || []).map(
    (t) => ({
      id: t.id,
      name: t.name,
      iconKey: t.icon_key,
      color: t.color,
    }),
  );

  const selectedTagIds = (productTagsResult.data || []).map((t) => t.tag_id);

  const subCategories = (categoriesResult.data || []).map((c) => ({
    id: c.id,
    name: c.name,
    categoryId: null as string | null,
  }));

  const selectedCategoryIds = (productCategoriesResult.data || [])
    .map((item) => item.category_id)
    .filter((categoryId): categoryId is string =>
      subCategories.some((category) => category.id === categoryId),
    );

  const initialFormData = {
    image: productRow.image_url || null,
    name: productRow.name || "",
    basePrice: String(productRow.base_price ?? ""),
    previousPrice: String(productRow.previous_price ?? ""),
    discountPercent: "",
    measurementUnit: productRow.measurement_unit || "unit",
    minQuantity: String(productRow.min_quantity || "1"),
    quantityStep: String(productRow.quantity_step || "1"),
    estimatedTimeRange: productRow.estimated_time || "",
    description: productRow.description || "",
    search_keywords: productRow.search_keywords || [],
    subCategoryId: selectedCategoryIds[0] || null,
    subCategoryIds: selectedCategoryIds,
    isAvailable: productRow.is_available ?? true,
    taxIncluded: productRow.tax_included ?? false,
    sections: [],
    tags: selectedTagIds,
  };

  return (
    <DishFormModal
      title={`Editar producto: ${productRow.name}`}
      closeHref={closeHref}
    >
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <MarketEditProductForm
          productId={productRow.id}
          initialSubCategories={subCategories}
          initialFormData={initialFormData}
          availableTags={availableTags}
          returnHref={closeHref}
        />
      </section>

      <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <ProductVariantsManager
          productId={productRow.id}
          groups={formattedGroups}
          revalidateUrl={closeHref}
        />
      </section>
    </DishFormModal>
  );
}
