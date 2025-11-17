import getRecommendedProducts from "@/src/lib/finalUser/stores/getRecommendedProducts";
import RecommendedProductsSection from "./RecommendedProductsSection";

export default async function RecommendedProductsSectionServer({
  partnerId,
  currentProductId,
  partnerType,
}: {
  partnerId: string;
  currentProductId?: string;
  partnerType?: string;
}) {
  const products = await getRecommendedProducts(
    partnerId,
    currentProductId,
    16
  );
  if (!products.length) return null;

  return (
    <RecommendedProductsSection
      products={products}
      partnerId={partnerId}
      partnerType={partnerType}
      currentProductId={currentProductId}
    />
  );
}
