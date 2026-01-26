import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type SubCategoryRow = Database["public"]["Tables"]["sub_categories"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type StoreMenu = {
  categories: { value: string; label: string; imageUrl?: string | null }[];
  groups: Array<{
    id: string; // sub_category_id or category_id
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
        | "discount_percentage"
      > & { display_price: number }
    >;
  }>;
};

export default async function getStoreMenu(
  partnerId: string,
  opts?: {
    category?: string | string[];
    q?: string | string[];
    partnerType?: string;
  },
): Promise<StoreMenu> {
  const supabase = await createClient();
  const selectedCategory = Array.isArray(opts?.category)
    ? opts?.category[0]
    : opts?.category;
  const searchQ = Array.isArray(opts?.q) ? opts?.q[0] : opts?.q;
  const isRestaurant = !opts?.partnerType || opts.partnerType === "restaurant";

  let categoriesList: {
    id: string;
    name: string;
    image_url?: string | null;
  }[] = [];
  let products: Array<
    Pick<
      ProductRow,
      | "id"
      | "name"
      | "image_url"
      | "base_price"
      | "previous_price"
      | "description"
      | "discount_percentage"
      | "sub_category_id"
      | "category_id"
    > & { display_price: number }
  > = [];

  // --- RESTAURANT LOGIC ---
  if (isRestaurant) {
    // 1. Fetch subcategories
    const { data: subCatsData, error: subErr } = await supabase
      .from("sub_categories")
      .select("id, name, image_url")
      .eq("partner_id", partnerId)
      .order("name", { ascending: true });
    if (subErr) console.error("getStoreMenu sub_categories error", subErr);
    categoriesList = (subCatsData || []) as {
      id: string;
      name: string;
      image_url: string | null;
    }[];

    // 2. Build products query
    let query = supabase
      .from("products")
      .select(
        "id, name, image_url, base_price, display_price, previous_price, description, discount_percentage, sub_category_id, category_id",
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
    if (prodErr) console.error("getStoreMenu products error", prodErr);
    products = (productsData || []) as typeof products;
  }

  // --- MARKET / OTHER LOGIC ---
  else {
    // 1. Build products query first (to find relevant categories)
    let query = supabase
      .from("products")
      .select(
        "id, name, image_url, base_price, display_price, previous_price, description, discount_percentage, sub_category_id, category_id",
      )
      .eq("partner_id", partnerId)
      .eq("is_available", true);

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory);
    }
    if (searchQ) {
      query = query.ilike("name", `%${searchQ}%`);
    }

    const { data: productsData, error: prodErr } = await query.order("name", {
      ascending: true,
    });
    if (prodErr) console.error("getStoreMenu products (market) error", prodErr);
    products = (productsData || []) as typeof products;

    // 2. Fetch categories that appear in these products
    const distinctCategoryIds = Array.from(
      new Set(products.map((p) => p.category_id).filter(Boolean)),
    ) as string[];

    if (distinctCategoryIds.length > 0) {
      const { data: catsData, error: catsErr } = await supabase
        .from("categories")
        .select("id, name, image_url")
        .in("id", distinctCategoryIds)
        .order("name", { ascending: true });
      if (catsErr) console.error("getStoreMenu categories error", catsErr);
      categoriesList = (catsData || []) as {
        id: string;
        name: string;
        image_url: string | null;
      }[];
    }
  }

  // --- GROUPING LOGIC (Shared-ish) ---
  const categoriesFn = categoriesList.map((c) => ({
    value: c.id,
    label: c.name,
    imageUrl: c.image_url,
  }));

  const groupsMap = new Map<
    string,
    {
      id: string;
      name: string;
      products: typeof products;
    }
  >();

  // Initialize groups for known categories
  for (const c of categoriesList) {
    groupsMap.set(c.id, { id: c.id, name: c.name, products: [] });
  }

  // Distribute products
  for (const p of products) {
    // Determine which ID to use for grouping
    const groupId = isRestaurant
      ? (p.sub_category_id ?? "")
      : (p.category_id ?? "");

    const group = groupsMap.get(groupId);
    if (group) {
      group.products.push(p);
    } else {
      // If product belongs to a category NOT in the list (or null), put in "Otros" or create ad-hoc
      // For Market, we fetched categories used by products, so they should exist unless null.
      // For Restaurant, we fetched all subcats.
      // Managing "Otros" / orphan products:
      const fallbackId = groupId || "others";
      if (!groupsMap.has(fallbackId)) {
        groupsMap.set(fallbackId, {
          id: fallbackId,
          name: "Otros",
          products: [],
        });
      }
      groupsMap.get(fallbackId)!.products.push(p);
    }
  }

  // Final filter: keep groups with products OR groups that match selectedCategory
  const groups = Array.from(groupsMap.values()).filter((g) => {
    if (selectedCategory && g.id === selectedCategory) return true;
    return g.products.length > 0;
  });

  // Sort groups? We iterated over categoriesList which was sorted.
  // Map insertion order is preserved in JS, so initialization order matters.
  // The 'others' or new groups added later will be at the end. Correct.

  return { categories: categoriesFn, groups };
}
