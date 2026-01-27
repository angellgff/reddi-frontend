import { createClient } from "@/src/lib/supabase/server";
import MarketEditProductForm from "@/src/components/features/partner/dashboard/market/editProduct/MarketEditProductForm";
import { notFound } from "next/navigation";
import ProductVariantsManager from "@/src/components/features/partner/dashboard/shared/ProductVariantsManager";

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
      `id, name, description, base_price, previous_price, unit, estimated_time, sub_category_id, is_available, tax_included, image_url, category_id`,
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

  const initialFormData = {
    image: productRow.image_url || null,
    name: productRow.name || "",
    basePrice: String(productRow.base_price ?? ""),
    previousPrice: String(productRow.previous_price ?? ""),
    discountPercent: "", // Market aún sin campo específico
    unit: productRow.unit || "",
    estimatedTimeRange: productRow.estimated_time || "",
    description: productRow.description || "",
    subCategoryId:
      // Si el producto tiene sub_category_id, usarlo; sino, intentar traer la categoría global si existiera una columna category_id (según esquema actual products.category_id existe)
      productRow.sub_category_id || (productRow as any).category_id || null,
    isAvailable: productRow.is_available ?? true,
    taxIncluded: productRow.tax_included ?? false,
    sections: [], // Market sin extras/secciones
  };

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <h1 className="font-semibold">Editar producto</h1>
      <section className="bg-white p-6 rounded-xl shadow-sm mt-6 mb-10">
        <MarketEditProductForm
          productId={productRow.id}
          initialSubCategories={subCategories}
          initialFormData={initialFormData}
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
