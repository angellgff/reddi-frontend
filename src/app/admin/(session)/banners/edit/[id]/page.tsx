import React from "react";
import EditBannerForm from "@/src/components/features/admin/banners/edit/EditBannerForm";
import { getBannerCategories } from "@/src/lib/admin/data/banners/getBannerCategories";
import { getCoupons } from "@/src/lib/admin/data/coupons/getCoupons";
import { getBannerById } from "@/src/lib/admin/data/banners/getBannerById";
import { notFound } from "next/navigation";

interface EditBannerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  const { id } = await params;

  const categoriesPromise = getBannerCategories();
  const couponsPromise = getCoupons();
  const bannerPromise = getBannerById(id);

  const [categories, coupons, banner] = await Promise.all([
    categoriesPromise,
    couponsPromise,
    bannerPromise,
  ]);

  if (!banner) {
    notFound();
  }

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <EditBannerForm
        categories={categories || []}
        coupons={coupons || []}
        initialData={banner}
      />
    </div>
  );
}
