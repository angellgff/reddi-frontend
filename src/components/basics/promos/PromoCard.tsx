// components/promotions/PromoCard.tsx (Versión Final con Corte Diagonal)

import Image from "next/image";
import Link from "next/link";

export type PromoCardProps = {
  title: string;
  subtitle: string;
  code: string;
  buttonText: string;
  imageUrl: string;
  bgColor: string;
  href: string;
  variant?: "mobile" | "desktop";
};

export default function PromoCard({
  title,
  subtitle,
  code,
  buttonText,
  imageUrl,
  bgColor,
  href,
  variant = "mobile",
}: PromoCardProps) {
  const containerSizeClass =
    variant === "desktop" ? "w-[317px] h-[146px]" : "w-[23rem] h-40";
  return (
    <Link
      href={href}
      className={`
        relative
        ${containerSizeClass}
        flex-shrink-0
        rounded-2xl
        shadow-sm
        overflow-hidden
        
        transition-transform duration-200 hover:scale-105
      `}
    >
      {/* CAPA 0: La imagen de fondo (sin cambios) */}
      <div className="absolute z-0 w-1/2 h-full right-0">
        <Image
          src={imageUrl}
          alt={`Promoción: ${title}`}
          fill
          className="object-cover z-1"
        />
      </div>

      {/* CAPA 1: El contenido de texto con el CORTE DIAGONAL */}
      <div
        className={`
          relative z-10
          h-full w-4/5
          flex flex-col justify-center p-4
          ${bgColor}
          
          [clip-path:polygon(0%_0%,_95%_0%,_70%_100%,_0%_100%)]
        `}
      >
        {/* El patrón SVG (sin cambios) */}
        <div className="absolute inset-0 bg-pattern-food bg-repeat opacity-10"></div>

        {/* Contenido de texto (sin cambios) */}
        <div className="relative">
          <h3 className="text-sm font-bold text-green-900">{title}</h3>
          <p className="mt-1 text-sm text-green-900">
            {subtitle}
            <br />
            {code}
          </p>
          <div
            className="
              mt-4 inline-block w-fit font-roboto
              rounded-full bg-green-400 px-5 py-2
              text-sm font-semibold text-white
            "
          >
            {buttonText}
          </div>
        </div>
      </div>
    </Link>
  );
}
