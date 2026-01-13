import { Database } from "@/src/lib/database.types";
import getRecommendedPartners from "@/src/lib/finalUser/getRecommendedPartners";
import SearchRecommendedList from "./SearchRecommendedList";

export default async function SearchRecommendedServer({
  partnerType,
  title,
}: {
  partnerType?: Database["public"]["Enums"]["partner_type"];
  title?: string;
}) {
  const data = await getRecommendedPartners(partnerType);
  if (!data || data.length === 0) return null;

  // Transform generic SliderCardProps to our specific Search props if they differ,
  // but they look mostly compatible.
  const mappedItems = data.map((item) => ({
    id: item.id,
    name: item.name,
    imageUrl: item.imageUrl,
    rating: item.rating,
    reviewCount: item.reviewCount,
    deliveryTime: item.deliveryTime,
    href: item.href,
  }));

  return <SearchRecommendedList items={mappedItems} title={title} />;
}
