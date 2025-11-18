import { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";
import { createClient } from "@/src/lib/supabase/server";

// Devuelve una lista de partners en los que el usuario compró recientemente
// mapeados a SliderCardProps para la sección "Pide otra vez".
export default async function getOrderAgainData(): Promise<SliderCardProps[]> {
  const supabase = await createClient();

  // 1) Usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  // 2) Últimos pedidos del usuario (tomamos varios y deduplicamos por partner)
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("partner_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  if (ordersError || !orders || orders.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const partnerIds: string[] = [];
  for (const o of orders) {
    const pid = (o as { partner_id?: string | null }).partner_id;
    if (pid && !seen.has(pid)) {
      seen.add(pid);
      partnerIds.push(pid);
    }
  }
  if (partnerIds.length === 0) {
    return [];
  }

  // 3) Cargar info de partners para construir las tarjetas
  const { data: partners, error: partnersError } = await supabase
    .from("partners")
    .select("id, name, image_url, average_rating, total_ratings")
    .in("id", partnerIds);

  if (partnersError || !partners) {
    return [];
  }

  // Mantener más o menos el orden por recencia según partnerIds
  const byId = new Map(partners.map((p) => [p.id, p] as const));
  const orderedPartners = partnerIds
    .map((id) => byId.get(id))
    .filter(Boolean) as typeof partners;

  const cards: SliderCardProps[] = orderedPartners.map((p) => {
    const avg =
      typeof (p as any).average_rating === "number"
        ? (p as any).average_rating
        : 0;
    const total =
      typeof (p as any).total_ratings === "number"
        ? (p as any).total_ratings
        : 0;
    return {
      id: p.id,
      name: p.name,
      imageUrl: p.image_url || "/ellipse.svg",
      rating: Number(Number(avg).toFixed(1)),
      reviewCount: Number(total) || 0,
      deliveryTime: "25-35 min",
      deliveryFee: "$0 tarifa de envío",
      href: `/user/stores/${p.id}`,
    };
  });

  return cards;
}
