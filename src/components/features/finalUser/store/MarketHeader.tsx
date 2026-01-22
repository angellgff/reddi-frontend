"use client";

import type { StoreDetails as BaseStoreDetails } from "@/src/lib/finalUser/stores/getStoreDetails";
import StarIcon from "@/src/components/icons/StarIcon";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Reuse the type definition or similar
type ExtendedStoreDetails = BaseStoreDetails & {
  banner_url?: string | null;
  logo_url?: string | null;
  delivery_time?: string | null;
};

export default function MarketHeader({
  store,
}: {
  store: ExtendedStoreDetails & { cover_image_url?: string | null };
}) {
  const router = useRouter();

  const banner =
    store.banner_url || store.cover_image_url || store.image_url || "";
  const logo = store.logo_url || store.image_url || "";
  const rating =
    typeof store.average_rating === "number"
      ? Number(store.average_rating.toFixed(1))
      : 0;
  const deliveryTime = store.delivery_time || "25-35 min";

  return (
    // Main container with "Market" styling (white, card overlay)
    <div className="relative w-full bg-transparent -mt-6 mb-[50px]">
      {/* Top Banner Background */}
      <div className="relative w-full h-[250px] overflow-hidden">
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      </div>

      {/* Top Bar Navigation */}
      <div className="absolute top-[49px] left-0 w-full px-[21px] flex justify-between items-center z-20 pointer-events-none">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="w-[37px] h-[37px] bg-[#D9D9D9] rounded-full flex items-center justify-center pointer-events-auto"
        >
          <ChevronLeft className="w-6 h-6 text-black" strokeWidth={1.5} />
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-[15px] pointer-events-auto">
          {/* Profile */}
          <button className="w-[37px] h-[37px] bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src="/new-design/nd-user.png"
              alt="Profile"
              width={18}
              height={18}
              className="object-contain" // Keeps image aspect ratio
            />
          </button>

          {/* Notifications */}
          <button className="w-[37px] h-[37px] bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src="/new-design/nd-bell.png"
              alt="Notifications"
              width={20}
              height={20}
              className="object-contain"
            />
          </button>

          {/* Cart */}
          <button className="w-[37px] h-[37px] bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src="/new-design/nd-cart.png"
              alt="Cart"
              width={24}
              height={24}
              className="object-contain"
            />
          </button>
        </div>
      </div>

      {/* Floating Info Card */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[148px] w-[90vw] h-[128px] bg-white rounded-[15px] z-10">
        {/* Top Row: Logo, Name, Rating */}
        <div className="absolute top-[30px] left-[19px] flex items-start gap-[11px]">
          {/* Logo: 54x54 circle */}
          <div className="w-[54px] h-[54px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm relative">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          {/* Info Column */}
          <div className="flex flex-col pt-[4px]">
            {/* Name */}
            <h1 className="text-black text-[20px] font-bold font-['Open_Sans'] leading-[24px]">
              {store.name}
            </h1>

            {/* Ratings Row */}
            <div className="flex items-center gap-1 mt-[6px]">
              {/* 5.0 */}
              <span className="text-[#6A6C71] text-[12px] font-semibold font-['Open_Sans'] leading-[18px]">
                {rating || "5.0"}
              </span>

              <StarIcon className="w-[10px] h-[10px] text-[#6A6C71] fill-[#6A6C71]" />

              <span className="text-[#6A6C71] text-[12px] font-normal mx-[2px]">
                •
              </span>

              {/* (143) */}
              <span className="text-[#6A6C71] text-[12px] font-semibold font-['Open_Sans'] leading-[18px]">
                ({store.total_ratings})
              </span>

              <span className="text-[#6A6C71] text-[12px] font-normal mx-[2px]">
                •
              </span>

              {/* 1.3Km */}
              <span className="text-[#6A6C71] text-[12px] font-semibold font-['Open_Sans'] leading-[18px]">
                1.3Km
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Green Box */}
        <div className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[80vw] h-[36px] bg-[rgba(0,213,133,0.07)] rounded-[7px] flex items-center gap-[6px] pl-2">
          <div className="text-[#04BD88] text-[10px] transform -scale-x-100">
            ⚡
          </div>
          <span className="text-[#494949] text-[11px] font-semibold font-['Open_Sans'] leading-[18px]">
            Rapido {deliveryTime}
          </span>
        </div>
      </div>
    </div>
  );
}
