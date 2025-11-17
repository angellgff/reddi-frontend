import { Suspense } from "react";
import getProductDetails from "@/src/lib/finalUser/stores/getProductDetails";
import ProductDetailsClient from "../../../../../../../components/features/finalUser/productDetails/ProductDetailsClient";
import getStoreDetails from "@/src/lib/finalUser/stores/getStoreDetails";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string; productId: string }>;
}) {
  const { id, productId } = await params;
  const [store, data] = await Promise.all([
    getStoreDetails(id),
    getProductDetails(id, productId),
  ]);
  if (!data) {
    return (
      <div className="p-4">
        <div className="rounded-xl border p-6">No se encontró el producto.</div>
      </div>
    );
  }
  return (
    <div className="p-2 md:p-4">
      <Suspense>
        <ProductDetailsClient details={data} partnerType={store.partner_type} />
      </Suspense>
    </div>
  );
}
