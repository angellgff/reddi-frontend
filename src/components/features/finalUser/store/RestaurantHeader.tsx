"use client";

import type { StoreDetails as BaseStoreDetails } from "@/src/lib/finalUser/stores/getStoreDetails";
import StarIcon from "@/src/components/icons/StarIcon";
import { ChevronLeft, Home } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { toggleCart } from "@/src/lib/store/uiSlice";
import { selectCartCount } from "@/src/lib/store/cartSlice";
import Badge from "@/src/components/basics/header/Badge";
import NdProfileIcon from "@/src/components/icons/NdProfileIcon";
import NdCartIcon from "@/src/components/icons/NdCartIcon";

// Reuse the type definition or similar
type ExtendedStoreDetails = BaseStoreDetails & {
  banner_url?: string | null;
  logo_url?: string | null;
  delivery_time?: string | null;
};

export default function RestaurantHeader({
  store,
}: {
  store: ExtendedStoreDetails & { cover_image_url?: string | null };
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);

  const banner =
    store.banner_url || store.cover_image_url || store.image_url || "";
  const logo = store.logo_url || store.image_url || "";
  const rating =
    typeof store.average_rating === "number"
      ? Number(store.average_rating.toFixed(1))
      : 0;
  const deliveryTime = store.delivery_time || "25-35 min";

  return (
    // Rediseño basado en 'Restaurante' view (Mobile Hero style)
    <div className="relative w-full h-[190px] overflow-hidden bg-white shadow-sm -mt-6 md:mt-0 md:rounded-2xl">
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

      {/* Top Bar Navigation */}
      <div className="absolute top-[26px] left-0 w-full px-[21px] flex justify-between items-center z-20 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Back Button -> Home */}
          <Link
            href="/user/home"
            className="w-[37px] h-[37px] bg-[#D9D9D9] rounded-full flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-black" strokeWidth={1.5} />
          </Link>

          {/* Restaurant Name */}
          <h1 className="text-white text-[24px] font-[800] leading-[24px] font-['Open_Sans'] drop-shadow-md">
            {store.name}
          </h1>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-[15px] pointer-events-auto">
          {/* Profile */}
          <button className="w-[37px] h-[37px] bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden">
            <NdProfileIcon className="w-[18px] h-[24px]" />
          </button>

          {/* Notifications replaced by Home */}
          <Link
            href="/user/home"
            className="w-[37px] h-[37px] bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden"
          >
            <Home className="w-6 h-6 text-black" />
          </Link>

          {/* Cart */}
          <button
            onClick={() => dispatch(toggleCart())}
            className="w-[37px] h-[37px] bg-[#D9D9D9] rounded-full flex items-center justify-center overflow-hidden relative"
          >
            <NdCartIcon className="w-5 h-5" />
            <div className="absolute top-[-2px] right-[-2px]">
              <Badge
                count={cartCount}
                color="bg-red-500"
                className="rounded-full shadow-sm ring-1 ring-white"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Contenido superpuesto (Bottom Left) */}
      <div className="absolute bottom-8 left-6 md:bottom-10 md:left-10 z-10 flex items-end gap-3">
        {/* Logo Profile */}
        <div className="w-[49px] h-[49px] rounded-full border-2 border-white overflow-hidden bg-gray-100">
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

        {/* Rating y Badge */}
        <div className="flex items-center gap-[9px]">
          {/* Rating Group: 4.8 + Star */}
          <div className="flex items-center gap-[2px]">
            <span className="text-[#F3F3F3] text-[12px] font-[600] font-['Open_Sans'] leading-[18px]">
              {rating}
            </span>
            <StarIcon
              className="w-[9px] h-[9px] text-[#F3F3F3] fill-[#F3F3F3]"
              fill="#ffffff"
            />
          </div>

          {/* Review Count */}
          <span className="text-[#F3F3F3] text-[12px] font-[600] font-['Open_Sans'] leading-[18px]">
            ({store.total_ratings})
          </span>

          {/* Delivery Time Badge */}
          <div className="flex items-center justify-center bg-[#F3F3F3] px-[4px] py-[2px] rounded-[6px] h-[16px] min-w-[40px]">
            <span className="text-black text-[8px] font-[500] font-['Inter'] leading-[16px] text-center">
              {deliveryTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
