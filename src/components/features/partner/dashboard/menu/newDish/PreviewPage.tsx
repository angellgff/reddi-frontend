// src/components/preview/PreviewPage.tsx

import Image from "next/image";
import { IDishFormState } from "./NewDishWizard"; // Ajusta la ruta a tus tipos
import ExtraSection from "./ExtraSection";

interface PreviewPageProps {
  formData: IDishFormState;
}

export default function PreviewPage({ formData }: PreviewPageProps) {
  const discountPercentage = formData.discount ? `-${formData.discount}%` : "";
  let imageUrl = null;
  if (formData.image && typeof formData.image === "string") {
    imageUrl = formData.image;
  } else if (formData.image instanceof File) {
    imageUrl = formData.image ? URL.createObjectURL(formData.image) : null;
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-xl font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda: Imagen */}
        <div>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={formData.dishName}
              width={500}
              height={500}
              className="w-full h-auto object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {formData.dishName}
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
            {discountPercentage && (
              <p className="font-bold text-primary">{discountPercentage}</p>
            )}
          </div>

          <span className="p-1 bg-[#EEF6FF] text-[#1C398E] border border-[#BEDBFF] rounded-lg text-xs font-roboto">
            {formData.estimatedTime}
          </span>

          <p className="mt-4 text-sm text-[#6A6C71]">{formData.description}</p>

          <hr className="my-6" />

          {/* Mapeo dinámico de las secciones de extras */}
          <div>
            {formData.dishSections.map((section) => (
              <ExtraSection key={section.id} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
