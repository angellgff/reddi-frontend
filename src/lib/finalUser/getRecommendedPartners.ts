import { createClient } from "@/src/lib/supabase/server";
import type { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";

export default async function getRecommendedPartners(): Promise<
  SliderCardProps[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("partners")
    .select("id, name, image_url, partner_type")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    console.error("getRecommendedPartners error", error);
    return [];
  }

  // Map to slider card props. Using simple defaults for rating/time/fee until logic is refined.
  const cards: SliderCardProps[] = data.map((p) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.image_url || "/ellipse.svg",
    rating: 4.8,
    reviewCount: 100,
    deliveryTime: "25-35 min",
    deliveryFee: "$0 tarifa de envío",
    href: `/user/stores/${p.id}`,
  }));

  return cards;
}
