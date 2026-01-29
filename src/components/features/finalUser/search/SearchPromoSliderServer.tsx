import React from "react";
import SearchPromoSlider from "./SearchPromoSlider";
import getActiveBanners from "@/src/lib/finalUser/home/data/getActiveBanners";

export default async function SearchPromoSliderServer() {
  const banners = await getActiveBanners("search_page");

  if (!banners || banners.length === 0) {
    return null;
  }

  // Normalize data for the client component if needed, or pass directly
  // SearchPromoSlider expects specific data structure. 
  // Let's pass the necessary fields.
  const promotions = banners.map((banner) => ({
    id: banner.id,
    title: banner.title,
    imageUrl: banner.image_url,
    actionLink: banner.action_link,
    description: banner.description,
  }));

  return <SearchPromoSlider promotions={promotions} />;
}
