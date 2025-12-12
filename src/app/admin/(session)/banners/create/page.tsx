import React from "react";
import CreateBannerForm from "@/src/components/features/admin/banners/create/CreateBannerForm";
import { getBannerCategories } from "@/src/lib/admin/data/banners/getBannerCategories";
import { getCoupons } from "@/src/lib/admin/data/coupons/getCoupons";

export default async function CreateBannerPage() {
  const categoriesPromise = getBannerCategories();
  const couponsPromise = getCoupons();

  const [categories, coupons] = await Promise.all([categoriesPromise, couponsPromise]);

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <CreateBannerForm categories={categories || []} coupons={coupons || []} />
    </div>
  );
}
