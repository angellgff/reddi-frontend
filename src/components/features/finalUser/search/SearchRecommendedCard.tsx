"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export type SearchRecommendedCardProps = {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  href: string;
};

export default function SearchRecommendedCard({
  name,
  imageUrl,
  rating,
  reviewCount,
  deliveryTime,
  href,
}: SearchRecommendedCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col flex-shrink-0 w-[226px] h-[177px] relative group"
    >
      {/* Image Container */}
      {/* width: 226px, height: 112px, radius: 6px */}
      <div className="relative w-[226px] h-[112px] rounded-[6px] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl || "/placeholder.png"}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info Container */}
      {/* Top offset in Figma was 121px, which is 9px margin from 112px image */}
      <div className="mt-[9px] flex flex-col items-start w-full relative">
        {/* Title */}
        {/* font-weight: 600; font-size: 14px; color: #000000; letter-spacing: -0.4px */}
        <h3 className="w-full font-[Open Sans] font-bold text-[14px] leading-[19px] tracking-[-0.4px] text-black truncate">
          {name}
        </h3>

        {/* Rating and Reviews Row */}
        {/* Top was 145px in Figma (121 + 19 + gap) */}
        <div className="flex items-center mt-[1px] w-full">
          {/* Rating */}
          <div className="flex items-end gap-[2px]">
            {/* 4.8 */}
            <span className="font-[Open Sans] font-semibold text-[12px] leading-[18px] text-[#6A6C71]">
              {rating}
            </span>
            {/* Star Icon Vector */}
            <Star className="w-[10px] h-[10px] fill-[#6A6C71] text-[#6A6C71] mb-[4px]" />
          </div>

          <div className="ml-[8px] flex items-center">
            {/* Note: Figma has (143) then Badge. Let's adjust relative to figma coordinates if needed.
                 Figma: Frame 2147226312 left 37px relative to group. Group left 0. 
                 Rating is width 29px. 37px is 8px gap. Correct.
             */}

            {/* Review Count (143) */}
            <span className="font-[Open Sans] font-semibold text-[12px] leading-[18px] text-[#606060]">
              ({reviewCount})
            </span>

            {/* Badge */}
            {/* Left: 39px from parent of this row? Figma says: Badge left 39px. 
                 Wait, (143) is left 0px in Frame 2147226312. Badge is left 39px in Frame 2147226312.
                 So gap between (143) start and Badge start is 39px. (143) width is ~29px. Gap ~10px.
             */}
            <div className="ml-[10px] bg-[#FFCF58] rounded-[6px] px-[4px] py-[2px] h-[14px] flex items-center justify-center gap-[4px]">
              <span className="font-[Open Sans] font-semibold text-[8px] leading-[16px] text-[#606060] text-center whitespace-nowrap">
                {deliveryTime}
              </span>
            </div>
          </div>
        </div>

        {/* Sponsored Label */}
        {/* Top 161px in Figma. 121 + 40. */}
        <div className="mt-[2px]">
          <span className="font-[Open Sans] font-normal text-[10px] leading-[16px] text-[#6A6C71]">
            Sponsored
          </span>
        </div>
      </div>
    </Link>
  );
}
