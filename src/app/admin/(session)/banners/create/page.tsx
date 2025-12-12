import React from "react";
import CreateBannerForm from "@/src/components/features/admin/banners/create/CreateBannerForm";
import { getBannerCategories } from "@/src/lib/admin/data/banners/getBannerCategories";

export default async function CreateBannerPage() {
  const categories = await getBannerCategories();

  return (
    <div className="bg-[#F0F2F5] px-8 py-6 min-h-screen">
      <CreateBannerForm categories={categories || []} />
    </div>
  );
}
