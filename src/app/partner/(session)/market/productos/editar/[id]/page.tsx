import { createClient } from "@/src/lib/supabase/server";
import MarketEditProductForm from "@/src/components/features/partner/dashboard/market/editProduct/MarketEditProductForm";
import { notFound } from "next/navigation";

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
      `id, name, description, base_price, previous_price, unit, estimated_time, sub_category_id, is_available, tax_included, image_url`
    )
    .eq("id", id) // Se usa la variable 'id'
    .eq("partner_id", partner.id)
    .single();
  if (productError || !productRow) notFound();

  // Subcategorías solo del partner
  const { data: subCatsData } = await supabase
    .from("sub_categories")
    .select("id, name, partner_id")
    .eq("partner_id", partner.id)
    .order("name");

  const subCategories = (subCatsData || []).map((c) => ({
    id: c.id,
    name: c.name,
    categoryId: null as any,
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
    subCategoryId: productRow.sub_category_id || null,
    isAvailable: productRow.is_available ?? true,
    taxIncluded: productRow.tax_included ?? false,
    sections: [], // Market sin extras/secciones
  };

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <h1 className="font-semibold">Editar producto</h1>
      <section className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <MarketEditProductForm
          productId={productRow.id}
          initialSubCategories={subCategories}
          initialFormData={initialFormData}
        />
      </section>
    </div>
  );
}
