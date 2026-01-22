import { Database } from "@/src/lib/database.types";
import getRecommendedPartners from "@/src/lib/finalUser/getRecommendedPartners";
import RecommendedSection from "./RecommendedSection";

export default async function RecommendedSectionServer({
  partnerType,
  title,
}: {
  partnerType?: Database["public"]["Enums"]["partner_type"];
  title?: string;
}) {
  const data = await getRecommendedPartners(partnerType);
  if (!data || data.length === 0) return null;
  console.log("RecommendedSectionServer data:", data);

  return <RecommendedSection recommendedItems={data} title={title} />;
}
