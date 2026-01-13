// components/promotions/PromoCard.tsx (Versión Solo Imagen)

import Image from "next/image";
import Link from "next/link";

export type PromoCardProps = {
  title?: string;
  subtitle?: string;
  code?: string;
  buttonText?: string;
  imageUrl: string;
  bgColor?: string;
  href: string;
  variant?: "mobile" | "desktop";
};

export default function PromoCard({
  title,
  imageUrl,
  href,
  variant = "mobile",
}: PromoCardProps) {
  const containerSizeClass =
    variant === "desktop" ? "w-[317px] h-[146px]" : "w-[375px] h-40";
  return (
    <Link
      href={href || "#"}
      className={`
        relative
        ${containerSizeClass}
        flex-shrink-0
        rounded-2xl
        shadow-sm
        overflow-hidden
        block
        transition-transform duration-200 hover:scale-105
      `}
    >
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={title || "Promoción"}
          fill
          className="object-cover"
        />
      </div>
    </Link>
  );
}
