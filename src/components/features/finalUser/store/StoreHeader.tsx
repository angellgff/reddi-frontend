"use client";

// Importar el tipo real desde el fetch server-side.
// El tipo original tiene: id, name, image_url, address, partner_type
import type { StoreDetails as BaseStoreDetails } from "@/src/lib/finalUser/stores/getStoreDetails";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";
import { useEffect } from "react";

import StarIcon from "@/src/components/icons/StarIcon";

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

  return (
    // Rediseño basado en 'Restaurante' view (Mobile Hero style)
    <div className="relative w-full h-[340px] rounded-b-[46px] overflow-hidden bg-white shadow-sm -mt-6 md:mt-0 md:rounded-2xl">
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
