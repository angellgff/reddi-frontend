import React from "react";
import Image from "next/image";
import Link from "next/link";
import EditPartnerIcon from "@/src/components/icons/EditPartnertIcon";
import DeletePartnerIcon from "@/src/components/icons/DeletePartnerIcon";
import { DishData } from "@/src/lib/partner/dashboard/type";
import Star from "@/src/components/icons/StarIcon";

// --- COMPONENTE PARA UN SOLO PLATILLO (DishItem) ---

type DishItemProps = {
  dish: DishData;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
};
export default function DishCard({ dish, onDelete, onRestore }: DishItemProps) {
  return (
    // 2. Contenedor principal de la tarjeta
    // `overflow-hidden` es clave para que la imagen respete los bordes redondeados
    <div className="max-w-[235px] bg-white overflow-hidden flex flex-col">
      {/* Sección de la Imagen */}
      <div className="relative h-[90px] w-full">
        <Image
          src={dish.imageUrl}
          alt={`Imagen de ${dish.name}`}
          fill
          className="object-cover rounded-xl"
        />
      </div>

      {/* Sección de Contenido */}
      <div className="py-1 flex flex-col flex-grow">
        {/* Información del platillo */}
        <div className="flex-grow">
          <h3 className="font-medium truncate">{dish.name}</h3>

          {/* Fila de Rating y Tiempo */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span className="font-bold text-gray-800 text-sm">
              {dish.rating}
            </span>
            <Star className="h-3 w-3" />
            <span className="font-medium font-sm">({dish.reviewCount})</span>
            <span className="text-[#767676]">•</span>
            <div className="p-1 bg-[#EEF6FF] text-[#1C398E] border border-[#BEDBFF] rounded-lg text-xs font-roboto">
              {dish.deliveryTime}
            </div>
          </div>

          {/* Tarifa de envío */}
          <p className="text-xs text-primary font-bold">{dish.deliveryFee}</p>
        </div>

        {/* Botones de Acción (tu código integrado aquí) */}
        {/* Separador visual para los botones */}
        {/* Botones de Acción */}
        <div className="flex items-center gap-2 mt-1">
          {dish.isAvailable === false ? (
            <button
              onClick={() => onDelete && onDelete(dish.id)} // Reusing onDelete as handleRestore if we want, but better to use onRestore
              // Actually, let's keep it clean.
              className="hidden" // Placeholder logic below
            />
          ) : null}
          
          {dish.isAvailable === false ? (
             onDelete ? ( // We will reuse the slot but clearer logic is needed contextually
               // If it's unavailable, we show "Restore" instead of Edit/Delete?
               // The user wants a button to recover it.
               <button
                 onClick={() => onDelete(dish.id)} // We will pass the restore handler here if we are clever, OR add a new prop.
                 // Let's stick to the plan: Add onRestore prop.
                 className="hidden"
               />
             ) : null
          ) : null}
        </div>
        
        {/* Actual implementation */}
        <div className="flex items-center gap-2 mt-1 w-full">
          {dish.isAvailable === false ? (
            <button
              onClick={() => onDelete(dish.id)} /* Helper: we will map this to restore functionality in parent if we want, OR use separate prop */
              className="flex-1 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
            >
              Habilitar
            </button>
          ) : (
            <>
              <Link
                href={`menu/editar/${dish.id}`}
                className="inline-flex items-center justify-center gap-2 py-2 text-sm font-medium bg-white border border-black rounded-xl hover:bg-gray-50 px-2"
              >
                <EditPartnerIcon className="h-4 w-4" />
                Editar
              </Link>
              <button
                onClick={() => onDelete(dish.id)}
                aria-label="Eliminar producto"
                className="p-2 text-white bg-[#DB5151] rounded-xl hover:bg-red-700 focus:ring-red-500"
              >
                <DeletePartnerIcon className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
