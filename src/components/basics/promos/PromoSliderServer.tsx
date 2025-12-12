import PromoSlider from "./PromoSlider";
import getActiveBanners from "@/src/lib/finalUser/home/data/getActiveBanners";
import { PromoCardProps } from "./PromoCard";

export default async function PromoSliderServer() {
  const banners = await getActiveBanners();

  const promotions: PromoCardProps[] = banners.map((banner) => ({
    title: banner.title,
    subtitle: banner.description || "",
    code: "", // Banners don't necessarily have a code
    buttonText: "Ver ahora",
    imageUrl: banner.image_url,
    bgColor: "bg-[#E6F4EA]", // Default light green background
    href: banner.action_link || "#",
    variant: "desktop", // Default, responsive logic handles resizing
  }));

  // If no banners, we might want to return nothing or keep empty
  if (promotions.length === 0) {
    return null; 
  }

  return <PromoSlider promotions={promotions} />;
}
