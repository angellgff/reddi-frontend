import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductsSection from "./ProductsSection";
import getProductsData from "@/src/lib/partner/dashboard/data/products/getProductsData";

export default async function ProductServer() {
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

  // Fetch parallel data: products and categories
  const [products, categoriesResult] = await Promise.all([
    getProductsData(),
    supabase
      .from("sub_categories")
      .select("id, name")
      .eq("partner_id", partner.id)
      .order("name"),
  ]);

  const categories =
    categoriesResult.data?.map((c) => ({
      value: c.id,
      label: c.name,
    })) || [];

  return <ProductsSection products={products} categories={categories} />;
}
