import { createClient } from "@/src/lib/supabase/server";
import type { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import { Database } from "@/src/lib/database.types";

export default async function getRecommendedPartners(
  partnerType?: Database["public"]["Enums"]["partner_type"],
  sectionKey: Database["public"]["Enums"]["app_section_key"] = "home_recommended_carousel",
): Promise<SliderCardProps[]> {
  const supabase = await createClient();

  // First check if we have explicit placements for this section
  let placementQuery = supabase
    .from("partner_placements")
    .select(
      `
          display_order,
          partner:partners(
             id, name, image_url, partner_type, average_rating, total_ratings, is_approved, is_active, is_sponsored
          )
       `,
    )
    .eq("section_key", sectionKey)
    .eq("partner.is_approved", true)
    .eq("partner.is_active", true)
    .order("display_order", { ascending: true });

  if (partnerType) {
    // NOTE: Filtering in JOIN is tricky with Supabase syntax for deep filtering sometimes,
    // but let's try standard approach or filter in memory if result set small
    // For now, let's filter in-memory if partnerType is provided, assuming placements list isn't huge.
  }

  const { data: placements, error: placementError } = await placementQuery;

  if (!placementError && placements && placements.length > 0) {
    // Filter null partners (e.g. inactive ones filtered out by join) and specific types
    const validPlacements = placements
      .map((p) => (Array.isArray(p.partner) ? p.partner[0] : p.partner))
      .filter(
        (partner) =>
          partner &&
          (!partnerType || partner.partner_type === partnerType) &&
          partner.is_approved &&
          partner.is_active,
      );

    if (validPlacements.length > 0) {
      return validPlacements.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        imageUrl: partner.image_url || "/placeholder.png",
        rating: partner.average_rating || 5.0,
        reviewCount: partner.total_ratings || 0,
        deliveryTime: "20-30 min", // Placeholder or calculate
        deliveryFee: "Gratis", // Placeholder
        type: partner.partner_type,
        href: `/user/stores/${partner.id}`,
        isSponsored: partner.is_sponsored || false,
      }));
    }
  }

  // Fallback to default logic if no placements found
  let query = supabase
    .from("partners")
    .select(
      "id, name, image_url, partner_type, average_rating, total_ratings, is_sponsored",
    )
    .eq("is_approved", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false }) // Or average_rating
    .limit(10);

  if (partnerType) {
    query = query.eq("partner_type", partnerType);
  }

  const { data, error } = await query;

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
      deliveryFee: "RD$0 tarifa de envío",
      href: `/user/stores/${p.id}`,
      isSponsored: !!p.is_sponsored,
    };
  });

  return cards;
}
