"use client";

// Importar el tipo real desde el fetch server-side.
// El tipo original tiene: id, name, image_url, address, partner_type
import type { StoreDetails as BaseStoreDetails } from "@/src/lib/finalUser/stores/getStoreDetails";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";
import { useEffect } from "react";

import StarIcon from "@/src/components/icons/StarIcon";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import SearchIcon from "@/src/components/icons/SearchIcon";
import { useStoreSearchStore } from "@/src/lib/store/store-search";

// Extendemos el tipo para permitir nuevos campos opcionales sin romper.
type ExtendedStoreDetails = BaseStoreDetails & {
  banner_url?: string | null;
  logo_url?: string | null;
  delivery_time?: string | null;
};

export default function StoreHeader({
  store,
}: {
  store: ExtendedStoreDetails & { cover_image_url?: string | null };
}) {
  const showStore = useFloatingButtonStore((state) => state.showStore);
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useStoreSearchStore();

  useEffect(() => {
    if (store?.name) {
      showStore(store.name);
    }
  }, [store?.name, showStore]);

  const banner =
    store.banner_url || store.cover_image_url || store.image_url || "";
  const logo = store.logo_url || store.image_url || "";
  const rating =
    typeof store.average_rating === "number"
      ? Number(store.average_rating.toFixed(1))
      : 0;
  // const phone = store.phone || "--";
  const deliveryTime = store.delivery_time || "25-35 min"; // fallback

  const isRestaurant =
    store.partner_type?.toLowerCase() === "restaurant" ||
    store.partner_type === "Restaurante";

  if (!isRestaurant) {
    // MARKET / SUPERMARKET VIEW
    return (
      // Main container with "Market" styling (white, card overlay)
      // Use mb-[100px] or similar to push the next content down, because the card is absolute.
      // Card height 177px. Top 106px relative to this container?
      // If image is 200px. Card overlaps bottom.
      // Let's make the container strictly hold the top banner, and push margin bottom for the card space.
      // Card top: 106px. Height: 177px. Total extent: 283px.
      // Image height: 200px (approx).
      // Overlap: 283 - 200 = 83px sticking out.
      <div className="relative w-full bg-transparent -mt-6 mb-[50px]">
        {/* Top Banner Background */}
        <div className="relative w-full h-[220px] overflow-hidden">
          {/* rounded-b-[15px] to match looking like a banner card? Or typically flat top, rounded bottom? The image shows rounded corners at bottom of header banner? No, image is full width. The CSS says "border-radius: 46px 46px 15px 15px;" for the MARKET frame? No, that's the whole screen. */}
          {/* The CSS "Rectangle 11878" (the gradient overlay) is inside the image area. */}

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

        {/* Back Button (Same position logic) */}
        <button
          onClick={() => router.back()}
          className="absolute top-[49px] left-[21px] w-[37px] h-[37px] bg-white rounded-full flex items-center justify-center z-20 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-[#04BD88]" strokeWidth={2.5} />
        </button>

        {/* Floating Info Card */}
        {/* CSS reference: Rectangle 11890, top 106px relative, width 333px, height 177px, radius 15px */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[106px] w-[90vw] h-[128px] bg-white rounded-[15px] z-10">
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

  return (
    // Rediseño basado en 'Restaurante' view (Mobile Hero style)
    <div className="relative w-full h-[340px] overflow-hidden bg-white shadow-sm -mt-6 md:mt-0 md:rounded-2xl">
      {/* Banner de fondo cubriendo todo el header */}
      <div className="absolute inset-0 w-full h-full bg-gray-200">
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
        ) : null}
        {/* Gradiente estilo 'Restaurante': linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.4) 100%) */}
        {/* Ajustado para legibilidad del texto blanco */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-[49px] left-[21px] w-[37px] h-[37px] bg-white rounded-full flex items-center justify-center z-20 shadow-sm"
      >
        <ChevronLeft className="w-5 h-5 text-[#04BD88]" strokeWidth={2.5} />
      </button>

      {/* Contenido superpuesto (Bottom Left) */}
      <div className="absolute bottom-8 left-6 md:bottom-10 md:left-10 z-10 flex flex-col gap-2">
        {/* Logo Profile */}
        <div className="w-[49px] h-[49px] rounded-full border-2 border-white overflow-hidden bg-gray-100 mb-1">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        {/* Nombre del Restaurante */}
        <h1 className="text-white text-[24px] font-[800] leading-[24px] font-['Open_Sans']">
          {store.name}
        </h1>

        {/* Rating y Badge */}
        <div className="flex items-center gap-2">
          {/* Rating Group */}
          <div className="flex items-center gap-[2px]">
            <span className="text-[#F3F3F3] text-[12px] font-[600] font-['Open_Sans'] leading-[18px]">
              {rating}
            </span>
            <StarIcon className="w-[9px] h-[9px] text-[#F3F3F3] fill-[#F3F3F3]" />
            <span className="text-[#F3F3F3] text-[12px] font-[600] font-['Open_Sans'] leading-[18px] ml-[2px]">
              ({store.total_ratings})
            </span>
          </div>

          {/* Delivery Time Badge */}
          <div className="flex items-center justify-center bg-[#04BD88] px-[4px] py-[2px] rounded-[6px] h-[16px] min-w-[40px]">
            <span className="text-[#F3F3F3] text-[8px] font-[500] font-['Inter'] leading-[16px] text-center">
              {deliveryTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
