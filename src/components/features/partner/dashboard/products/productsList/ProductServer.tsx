import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductsSection from "./ProductsSection";
import getProductsData from "@/src/lib/partner/dashboard/data/products/getProductsData";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";

interface ProductServerProps {
  q: string | string[] | undefined;
  category: string | string[] | undefined;
  available: string | string[] | undefined;
}

export default async function ProductServer({
  q,
  category,
  available,
}: ProductServerProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/partner/login");
  }

  // Obtener partner id para filtrar categorías
  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!partner) {
    // Manejar caso error o redirect
    return <div>Error: Partner no encontrado</div>;
  }

  // Fetch parallel data: products, filter categories, form categories and tags
  const [
    products,
    categoriesResult,
    formCategoriesResult,
    tagDefinitionsResult,
  ] = await Promise.all([
    getProductsData({ q, category, isAvailable: available }),
    supabase.from("categories").select("id, name").order("name"),
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

  const categories =
    categoriesResult.data?.map((c) => ({
      value: c.id,
      label: c.name,
    })) || [];

  const initialSubCategories =
    formCategoriesResult.data?.map((c) => ({
      id: c.id,
      name: c.name,
      categoryId: null,
    })) || [];

  const availableTags: ProductTagDefinition[] =
    tagDefinitionsResult.data?.map((t) => ({
      id: t.id,
      name: t.name,
      iconKey: t.icon_key,
      color: t.color,
    })) || [];

  return (
    <ProductsSection
      products={products}
      categories={categories}
      initialSubCategories={initialSubCategories}
      availableTags={availableTags}
    />
  );
}
