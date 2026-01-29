import { createClient } from "@/src/lib/supabase/server";
import type { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import type { Database } from "@/src/lib/database.types";

interface SearchOptions {
  query: string;
  types?: string[];
  sort?: string;
  minRating?: number;
}

export interface SearchResultPartner extends SliderCardProps {
  partnerType?: string;
  products: {
    id: string;
    name: string;
    image_url: string | null;
    base_price: number;
    description: string | null;
    display_price: number;
  }[];
}

export async function searchPartners({
  query,
  types,
  sort,
  minRating,
}: SearchOptions): Promise<SearchResultPartner[]> {
  const supabase = await createClient();

  let dbQuery = supabase
    .from("partners")
    .select(
      "id, name, image_url, cover_image_url, partner_type, average_rating, total_ratings, products(id, name, image_url, base_price, display_price, description)",
    )
    .eq("is_approved", true);

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  if (types && types.length > 0) {
    // Cast to proper DB Enum type type to avoid 'any'
    const typedTypes = types as Database["public"]["Enums"]["partner_type"][];
    dbQuery = dbQuery.in("partner_type", typedTypes);
  }

  if (minRating) {
    dbQuery = dbQuery.gte("average_rating", minRating);
  }

  if (sort === "rating_desc") {
    dbQuery = dbQuery.order("average_rating", { ascending: false });
  } else if (sort === "reviews_desc") {
    dbQuery = dbQuery.order("total_ratings", { ascending: false });
  } else {
    // Default sort
    dbQuery = dbQuery.order("name", { ascending: true });
  }

  const { data, error } = await dbQuery.limit(50);

  if (error) {
    console.error("searchPartners error", error);
    return [];
  }

  const cards: SliderCardProps[] = (data || []).map((p) => {
    const avg = typeof p.average_rating === "number" ? p.average_rating : 0;
    const total = typeof p.total_ratings === "number" ? p.total_ratings : 0;
    return {
      id: p.id,
      name: p.name,
      imageUrl: p.cover_image_url || p.image_url || "/ellipse.svg",
      rating: Number(avg.toFixed(1)),
      reviewCount: total,
      deliveryTime: "25-35 min",
      deliveryFee: "RD$0 ",
      href: `/user/stores/${p.id}`,
      partnerType: p.partner_type,
      products: (p.products as any[])?.slice(0, 5) || [],
    };
  });

  return cards as SearchResultPartner[];
}
