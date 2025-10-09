import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type SubCategoryRow = Database["public"]["Tables"]["sub_categories"]["Row"];

export type StoreMenu = {
  categories: { value: string; label: string }[];
  groups: Array<{
    id: string; // sub_category_id
    name: string;
    products: Array<
      Pick<
        ProductRow,
        | "id"
        | "name"
        | "image_url"
        | "base_price"
        | "previous_price"
        | "description"
      >
    >;
  }>;
};

export default async function getStoreMenu(
  partnerId: string,
  opts?: { category?: string | string[]; q?: string | string[] }
): Promise<StoreMenu> {
  const supabase = await createClient();
  const selectedCategory = Array.isArray(opts?.category)
    ? opts?.category[0]
    : opts?.category;
  const searchQ = Array.isArray(opts?.q) ? opts?.q[0] : opts?.q;

  // Fetch subcategories for partner products
  const { data: subCatsData, error: subErr } = await supabase
    .from("sub_categories")
    .select("id, name")
    .eq("partner_id", partnerId)
    .order("name", { ascending: true });
  if (subErr) {
    console.error("getStoreMenu sub_categories error", subErr);
  }
  const subCats = (subCatsData || []) as Pick<SubCategoryRow, "id" | "name">[];

  // Build products query filtered by partner and optional category/search
  let query = supabase
    .from("products")
    .select(
      "id, name, image_url, base_price, previous_price, description, sub_category_id"
    )
    .eq("partner_id", partnerId)
    .eq("is_available", true);

  if (selectedCategory) {
    query = query.eq("sub_category_id", selectedCategory);
  }
  if (searchQ) {
    query = query.ilike("name", `%${searchQ}%`);
  }

  const { data: productsData, error: prodErr } = await query.order("name", {
    ascending: true,
  });
  if (prodErr) {
    console.error("getStoreMenu products error", prodErr);
  }
  const products = (productsData || []) as Array<
    Pick<
      ProductRow,
      | "id"
      | "name"
      | "image_url"
      | "base_price"
      | "previous_price"
      | "description"
      | "sub_category_id"
    >
  >;

  // Map categories options and group products by sub_category
  const categories = subCats.map((c) => ({ value: c.id, label: c.name }));
  const groupsMap = new Map<
    string,
    { id: string; name: string; products: any[] }
  >();
  for (const sc of subCats) {
    groupsMap.set(sc.id, { id: sc.id, name: sc.name, products: [] });
  }
  for (const p of products) {
    const group = groupsMap.get(p.sub_category_id) || {
      id: p.sub_category_id,
      name:
        categories.find((c) => c.value === p.sub_category_id)?.label || "Otros",
      products: [],
    };
    group.products.push({
      id: p.id,
      name: p.name,
      image_url: p.image_url,
      base_price: p.base_price,
      previous_price: p.previous_price,
      description: p.description,
    });
    groupsMap.set(group.id, group);
  }

  // Only keep groups that have products (unless a category is explicitly selected)
  const groups = Array.from(groupsMap.values()).filter((g) =>
    selectedCategory ? g.id === selectedCategory : g.products.length > 0
  );

  return { categories, groups };
}
