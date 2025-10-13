import { Suspense } from "react";
import getProductDetails from "@/src/lib/finalUser/stores/getProductDetails";
import ProductDetailsClient from "../../../../../../../components/features/finalUser/productDetails/ProductDetailsClient";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string; productId: string }>;
}) {
  const { id, productId } = await params;
  const data = await getProductDetails(id, productId);
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
        <ProductDetailsClient details={data} />
      </Suspense>
    </div>
  );
}
