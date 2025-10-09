import getRecommendedPartners from "@/src/lib/finalUser/getRecommendedPartners";
import RecommendedSection from "./RecommendedSection";

export default async function RecommendedSectionServer() {
  const data = await getRecommendedPartners();
  return <RecommendedSection recommendedItems={data}></RecommendedSection>;
}
