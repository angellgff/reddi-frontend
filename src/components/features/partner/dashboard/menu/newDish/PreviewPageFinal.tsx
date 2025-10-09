// src/components/features/partner/dashboard/menu/newDish/PreviewPageFinal.tsx

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import ExtraSection from "./ExtraSection";
import {
  CreateProductFormState,
  ProductExtra,
  ProductSubCategory,
} from "@/src/lib/partner/productTypes";

interface PreviewPageProps {
  formData: CreateProductFormState;
  onSubmitAll: () => void;
  submitting: boolean;
  submitError: string | null;
  extrasCatalog: ProductExtra[];
  subCategories: ProductSubCategory[];
}

export default function PreviewPageFinal({
  formData,
  onSubmitAll,
  submitting,
  submitError,
  extrasCatalog,
  subCategories,
}: PreviewPageProps) {
  const router = useRouter();
  const discountText = formData.discountPercent
    ? `-${formData.discountPercent}%`
    : "";

  let imageUrl: string | null = null;
  if (formData.image && typeof (formData.image as any) === "string") {
    imageUrl = formData.image as unknown as string;
  } else if (formData.image instanceof File) {
    imageUrl = formData.image ? URL.createObjectURL(formData.image) : null;
  }

  const categoryName = formData.subCategoryId
    ? subCategories.find((c) => c.id === formData.subCategoryId)?.name ||
      formData.subCategoryId
    : "(sin categoría)";

  return (
    <div className="w-full my-10 p-6 bg-white rounded-xl font-sans">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-[#1C398E] hover:underline"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </button>
      </div>
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda: Imagen */}
        <div className="w-full">
          {imageUrl ? (
            <div className="relative w-full h-[270px] overflow-hidden rounded-lg bg-gray-100">
              {" "}
              {/* Añadimos 'relative' */}
              <Image
                src={imageUrl}
                alt={formData.name || "Producto"}
                fill // 👈 Usamos fill en lugar de width y height
                className="object-contain" // 👈 Y le decimos cómo debe ajustarse
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Opcional pero recomendado para optimizar
              />
            </div>
          ) : (
            <div className="w-full h-[270px] bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles */}
        <div className="w-full">
          <h1 className="text-2xl font-semibold text-gray-900">
            {formData.name || "(sin nombre)"}
          </h1>

          <div className="flex items-baseline gap-3 my-2">
            <p className="text-2xl font-semibold text-primary">
              ${formData.basePrice} {formData.unit}
            </p>
            {formData.previousPrice && (
              <p className="text-sm text-[#6A6C71] line-through font-roboto">
                ${formData.previousPrice}
              </p>
            )}
            {discountText && (
              <p className="font-bold text-primary">{discountText}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#1C398E]">
            <span className="p-1 bg-[#EEF6FF] border border-[#BEDBFF] rounded-lg font-roboto">
              {formData.estimatedTimeRange || "(sin tiempo)"}
            </span>
            <span className="text-[#6A6C71]">Categoría: {categoryName}</span>
          </div>

          <p className="mt-4 text-sm text-[#6A6C71]">{formData.description}</p>

          <hr className="my-6" />

          {/* Secciones de extras */}
          <div>
            {formData.sections.length === 0 ? (
              <p className="text-sm text-gray-500">Sin secciones</p>
            ) : (
              formData.sections.map((section) => (
                <ExtraSection
                  key={section.clientId}
                  section={section}
                  extrasCatalog={extrasCatalog}
                />
              ))
            )}
          </div>

          {/* Acciones */}
          {submitError && (
            <div className="text-red-600 text-sm mt-4">{submitError}</div>
          )}
        </div>
      </div>
    </div>
  );
}
