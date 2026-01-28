import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { SliderCardProps } from "@/src/components/basics/itemsSlider/SliderItem";

export default function RecommendedCard({
  name,
  imageUrl,
  rating,
  reviewCount,
  deliveryTime,
  href,
  className,
  isSponsored,
}: SliderCardProps) {
  return (
    <Link
      href={href}
      className={`group block flex-shrink-0 relative w-[226px] h-[177px] ${className || ""}`}
    >
      <div className="flex flex-col w-full h-full font-openSans">
        {/* Imagen */}
        <div className="relative w-[226px] h-[112px]">
          <Image
            src={imageUrl}
            alt={`Imagen de ${name}`}
            fill
            className="rounded-[6px] object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Contenido/Info */}
        <div className="relative mt-[9px] h-[56px] w-[187px]">
          {/* Title */}
          <h3 className="text-[14px] font-semibold leading-[19px] tracking-[-0.4px] text-black truncate">
            {name}
          </h3>

          {/* Rating Row: 4.8 * (143) Badge */}
          <div className="mt-[5px] flex items-center h-[16px]">
            {/* Rating Number */}
            <span className="text-[12px] font-semibold leading-[18px] text-[#6A6C71] mr-[2px]">
              {rating}
            </span>

            {/* Star Icon */}
            <Star className="w-[9px] h-[9px] fill-[#6A6C71] text-[#6A6C71] mr-[4px]" />

            {/* Review Count */}
            <span className="text-[12px] font-semibold leading-[18px] text-[#606060] mr-[10px]">
              ({reviewCount})
            </span>

            {/* Delivery Time Badge */}
            <div className="flex items-center justify-center px-[4px] py-[2px] gap-[4px] bg-[#FFCF58] rounded-[6px] h-[11px]">
              <span className="text-[8px] font-semibold leading-[16px] text-black text-center whitespace-nowrap">
                {deliveryTime}
              </span>
            </div>
          </div>

          {/* Sponsored Label */}
          {isSponsored && (
            <div className="absolute top-[40px] left-0">
              <span className="text-[10px] font-normal leading-[16px] text-[#6A6C71] flex items-center">
                Patrocinado
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
