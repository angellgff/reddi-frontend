import React from "react";
import Image from "next/image";
import EditPartnerIcon from "@/src/components/icons/EditPartnertIcon";
import DeletePartnerIcon from "@/src/components/icons/DeletePartnerIcon";
import { DishData } from "@/src/lib/partner/dashboard/type";

// --- COMPONENTE PARA UN SOLO PLATILLO (DishItem) ---

type DishItemProps = {
  dish: DishData;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onEdit: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
};
export default function DishCard({
  dish,
  onDelete,
  onRestore,
  onEdit,
  isSelected = false,
  onToggleSelect,
}: DishItemProps) {
  return (
    <div
      className={`relative flex w-[140px] flex-col overflow-hidden rounded-lg border bg-white ${
        dish.isAvailable === false
          ? "border-[#D1D5DC] bg-[#F9FAFB]"
          : "border-[#009966] bg-[#ECFDF5]"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggleSelect?.(dish.id)}
        aria-label={
          isSelected ? "Deseleccionar producto" : "Seleccionar producto"
        }
        className={`absolute left-1 top-1 z-10 h-4 w-4 rounded border ${
          isSelected
            ? "border-[#009966] bg-[#009966]"
            : "border-[#D1D5DC] bg-white"
        }`}
      >
        {isSelected ? <span className="text-[10px] text-white">✓</span> : null}
      </button>

      {dish.isAvailable === false ? (
        <span className="absolute right-1 top-1 z-10 rounded bg-[#4A5565] px-1.5 py-0.5 text-[8px] font-semibold text-white">
          Inactivo
        </span>
      ) : null}

      <div className="relative m-1 h-20 rounded bg-white">
        <Image
          src={dish.imageUrl}
          alt={dish.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="px-2 pb-2 pt-1">
        <p className="truncate text-[10px] font-semibold text-[#101828]">
          {dish.name}
        </p>
        <p className="mt-1 text-xs font-bold text-[#101828]">
          {dish.deliveryTime || "--"}
        </p>

        <div className="mt-2 flex items-center gap-1">
          {dish.isAvailable === false ? (
            <button
              type="button"
              onClick={() => onRestore && onRestore(dish.id)}
              className="h-6 flex-1 rounded border border-[#D1D5DC] bg-white text-[9px] font-medium text-[#0A0A0A]"
            >
              Activar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEdit(dish.id)}
              className="inline-flex h-6 flex-1 items-center justify-center gap-1 rounded border border-[#D1D5DC] bg-white text-[9px] font-medium text-[#0A0A0A]"
            >
              <EditPartnerIcon className="h-3 w-3" />
              Editar
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(dish.id)}
            aria-label="Eliminar producto"
            className="inline-flex h-6 w-6 items-center justify-center rounded bg-[#FB2C36] text-white"
          >
            <DeletePartnerIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
