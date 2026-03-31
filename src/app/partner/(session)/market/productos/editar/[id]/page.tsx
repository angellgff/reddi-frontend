import { createClient } from "@/src/lib/supabase/server";
import MarketEditProductForm from "@/src/components/features/partner/dashboard/market/editProduct/MarketEditProductForm";
import { notFound } from "next/navigation";
import ProductVariantsManager from "@/src/components/features/partner/dashboard/shared/ProductVariantsManager";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";

// 1. Se actualiza la interfaz para que 'params' sea una Promise
interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMarketProductPage({ params }: EditPageProps) {
  // 2. Se usa 'await' para resolver la promesa y obtener el 'id'
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Obtener partner_id del usuario autenticado
  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!partner) notFound();

  // Traer producto asegurando que pertenece al partner (usando el 'id' resuelto)
  const { data: productRow, error: productError } = await supabase
    .from("products")
    .select(
      `id, name, description, base_price, previous_price, unit, measurement_unit, min_quantity, quantity_step, estimated_time, search_keywords, sub_category_id, is_available, tax_included, image_url, category_id`,
    )
    .eq("id", id) // Se usa la variable 'id'
    .eq("partner_id", partner.id)
    .single();
  if (productError || !productRow) notFound();

  // Fetch Variants and Groups
  const { data: groupsData } = await supabase
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
    .order("display_order", { ascending: true });

  const formattedGroups = (groupsData || []).map((g) => ({
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

  // Fetch Tags Definitions
  const { data: tagDefinitions } = await supabase
    .from("product_tag_definitions")
    .select("id, name, icon_key, color")
    .eq("is_active", true)
    .order("name");

  // Fetch Current Tags
  const { data: currentTags } = await supabase
    .from("product_tags")
    .select("tag_id")
    .eq("product_id", id);

  const selectedTagIds = (currentTags || []).map((t) => t.tag_id);

  // Subcategorías (Categorías globales) para el selector
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const subCategories = (categoriesData || []).map((c) => ({
    id: c.id,
    name: c.name,
    categoryId: null as string | null,
  }));

  // Determinar el ID de categoría original del producto
  const rawCategoryId =
    productRow.sub_category_id || (productRow as any).category_id || null;

  // Verificar si la categoría existe en la lista de activos
  const categoryExists = subCategories.some((c) => c.id === rawCategoryId);

  // Si existe se usa, si no, se deja null para evitar error en formulario (caso legacy)
  const validCategoryId = categoryExists ? rawCategoryId : null;

  const initialFormData = {
    image: productRow.image_url || null,
    name: productRow.name || "",
    basePrice: String(productRow.base_price ?? ""),
    previousPrice: String(productRow.previous_price ?? ""),
    discountPercent: "", // Market aún sin campo específico
    measurementUnit: productRow.measurement_unit || "unit",
    minQuantity: String(productRow.min_quantity || "1"),
    quantityStep: String(productRow.quantity_step || "1"),
    estimatedTimeRange: productRow.estimated_time || "",
    description: productRow.description || "",
    search_keywords: productRow.search_keywords || [],
    subCategoryId: validCategoryId,
    isAvailable: productRow.is_available ?? true,
    taxIncluded: productRow.tax_included ?? false,
    sections: [], // Market sin extras/secciones
    tags: selectedTagIds,
  };

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
      <h1 className="font-semibold">Editar producto</h1>
      <section className="bg-white p-6 rounded-xl shadow-sm mt-6 mb-10">
        <MarketEditProductForm
          productId={productRow.id}
          initialSubCategories={subCategories}
          initialFormData={initialFormData}
          availableTags={availableTags}
        />
      </section>
      <section className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <ProductVariantsManager
          productId={productRow.id}
          groups={formattedGroups}
        />
      </section>
    </div>
  );
}
