"use client";

import React from "react";
import Image from "next/image";

type Tag = {
  value: string;
  label: string;
  imageUrl?: string | null;
};

type CategoryTabsProps = {
  tags: Tag[];
  selectedCategoryId: string; // El ID de la categoría actualmente seleccionada
  onSelectCategory: (id: string) => void; // Función para notificar al padre de un cambio
  disabled?: boolean;
};

export default function CategoryTabs({
  tags,
  selectedCategoryId,
  onSelectCategory,
  disabled = false,
}: CategoryTabsProps) {
  return (
    <>
      {tags.map((tag) => {
        const isSelected = tag.value === selectedCategoryId;
        const imageSrc = tag.imageUrl || "/dish.svg";

        return (
          <button
            key={tag.value}
            onClick={() => onSelectCategory(tag.value)}
            disabled={disabled}
            className={`
                group flex flex-col items-center gap-2 p-2 rounded-xl transition-all
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-50"
                }
              `}
          >
            <div
              className={`
                  relative w-16 h-16 rounded-full overflow-hidden border-2
                  ${
                    isSelected
                      ? "border-primary shadow-md"
                      : "border-transparent bg-gray-100 group-hover:border-gray-200"
                  }
                `}
            >
              <Image
                src={imageSrc}
                alt={tag.label}
                fill
                className="object-cover p-1"
                sizes="64px"
              />
            </div>
            <span
              className={`
                  text-sm font-medium
                  ${
                    isSelected
                      ? "text-primary font-bold"
                      : "text-gray-600 group-hover:text-gray-900"
                  }
                `}
            >
              {tag.label}
            </span>
          </button>
        );
      })}
    </>
  );
}
