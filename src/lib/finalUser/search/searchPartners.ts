import { createClient } from "@/src/lib/supabase/server";
import type { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import { Database } from "@/src/lib/database.types";

interface SearchOptions {
  query: string;
  types?: string[];
  sort?: string;
  minRating?: number;
}

export async function searchPartners({
  query,
  types,
  sort,
  minRating,
}: SearchOptions): Promise<SliderCardProps[]> {
  const supabase = await createClient();

  let dbQuery = supabase
    .from("partners")
    .select("id, name, image_url, partner_type, average_rating, total_ratings")
    .eq("is_approved", true);

  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`);
  }

  if (types && types.length > 0) {
    // Cast to any to avoid strict enum typing issues if dynamic string passed, 
    // though ideally we validate against enum.
    dbQuery = dbQuery.in("partner_type", types as any);
  }

  if (minRating) {
    dbQuery = dbQuery.gte("average_rating", minRating);
  }

  if (sort === "rating_desc") {
    dbQuery = dbQuery.order("average_rating", { ascending: false });
  } else if (sort === "reviews_desc") {
    dbQuery = dbQuery.order("total_ratings", { ascending: false });
  } else {
    // Default sort: relevance (if query provided? Supabase doesn't have text search rank easily via JS client without RPC) 
    // or just name/created.
    // Let's default to created_at desc or something unrelated if no query, 
    // but if query, usually name ilike is enough filtering. 
    // We'll leave default order to Supabase natural or name if simple.
    // Or maybe order by creation?
    // Let's stick to default which usually is insertion order or explicit param.
    // We'll add a secondary sort to ensure stability
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
      imageUrl: p.image_url || "/ellipse.svg",
      rating: Number(avg.toFixed(1)),
      reviewCount: total,
      deliveryTime: "25-35 min",
      deliveryFee: "RD$0 ",
      href: `/user/stores/${p.id}`,
    };
  });

  return cards;
}
