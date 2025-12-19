import { getCouponById } from "@/src/lib/admin/data/coupons/getCoupons";
import { notFound } from "next/navigation";
import EditCouponForm from "../../../../../components/features/admin/EditCouponForm";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await getCouponById(id);

  if (!coupon) {
    notFound();
  }

  return <EditCouponForm coupon={coupon} />;
}
