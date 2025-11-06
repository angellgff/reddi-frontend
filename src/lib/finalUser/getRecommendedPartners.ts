import { createClient } from "@/src/lib/supabase/server";
import type { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";

export default async function getRecommendedPartners(): Promise<
  SliderCardProps[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partners")
    .select("id, name, image_url, partner_type, average_rating, total_ratings")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    console.error("getRecommendedPartners error", error);
    return [];
  }

  // Map to slider card props. Using simple defaults for rating/time/fee until logic is refined.
  const cards: SliderCardProps[] = data.map((p) => {
    const avg = typeof p.average_rating === "number" ? p.average_rating : 0;
    const total = typeof p.total_ratings === "number" ? p.total_ratings : 0;
    return {
      id: p.id,
      name: p.name,
      imageUrl: p.image_url || "/ellipse.svg",
      rating: Number(avg.toFixed(1)),
      reviewCount: total,
      deliveryTime: "25-35 min",
      deliveryFee: "$0 tarifa de envío",
      href: `/user/stores/${p.id}`,
    };
  });

  return cards;
}
