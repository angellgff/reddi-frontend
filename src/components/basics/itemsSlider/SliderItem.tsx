// components/RestaurantCard.tsx

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Star } from "lucide-react"; // Importamos el icono de estrella

export type SliderCardProps = {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: string;
  href: string;
};

const SliderCard: React.FC<SliderCardProps> = ({
  name,
  imageUrl,
  rating,
  reviewCount,
  deliveryTime,
  deliveryFee,
  href,
}) => {
  return (
    <Link href={href} className="group flex-shrink-0 w-72 md:w-80">
      <div className="flex flex-col overflow-hidden rounded-xl  transition-shadow duration-300 group-hover:shadow-xl">
        {/* Imagen del restaurante */}
        <div className="relative h-28 w-full">
          <Image
            src={imageUrl}
            alt={`Imagen de ${name}`}
            layout="fill"
            objectFit="cover" // Esto asegura que la imagen cubra el espacio sin deformarse
            className="transition-transform duration-300 group-hover:scale-105 rounded-b-xl"
          />
        </div>

        {/* Contenido de la tarjeta */}
        <div className="flex flex-col gap-1 bg-white ">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {name}
          </h3>

          {/* Fila de Rating y Tiempo de entrega */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-bold text-black">{rating}</span>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">({reviewCount})</span>
            </div>
            <span>•</span>
            <div className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-roboto text-blue-800">
              {deliveryTime}
            </div>
          </div>

          {/* Tarifa de envío */}
          <p className="text-sm text-primary font-bold">{deliveryFee}</p>
        </div>
      </div>
    </Link>
  );
};

export default SliderCard;
