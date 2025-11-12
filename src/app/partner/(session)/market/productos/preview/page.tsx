import ProductPreviewClient from "@/src/components/features/partner/dashboard/market/preview/ProductPreviewClient";
import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";

// Server wrapper: if productId provided fetch persisted product fields (edit preview)
// Otherwise rely entirely on draft query params handled client-side.
export default async function MarketProductPreviewPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const productId =
    typeof searchParams.productId === "string"
      ? searchParams.productId
      : undefined;
  let serverProduct: any = null;
  if (productId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) notFound();
    // Partner ownership check
    const { data: partner } = await supabase
      .from("partners")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!partner) notFound();
    const { data: productRow } = await supabase
      .from("products")
      .select(
        "id, name, description, base_price, previous_price, unit, estimated_time, image_url, partner_id"
      )
      .eq("id", productId)
      .eq("partner_id", partner.id)
      .single();
    if (productRow) {
      serverProduct = {
        id: productRow.id,
        name: productRow.name,
        description: productRow.description,
        basePrice: productRow.base_price,
        previousPrice: productRow.previous_price,
        unit: productRow.unit,
        estimatedTimeRange: productRow.estimated_time,
        imageUrl: productRow.image_url,
        partnerId: partner.id,
      };
    }
  }

  return <ProductPreviewClient serverProduct={serverProduct} />;
}
