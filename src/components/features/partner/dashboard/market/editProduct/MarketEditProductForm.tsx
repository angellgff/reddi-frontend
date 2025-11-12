"use client";

import { useCallback, useState } from "react";
import NewDishStep1 from "@/src/components/features/partner/dashboard/menu/newDish/NewDishStep1";
import CreateCategoryModal from "@/src/components/features/partner/dashboard/menu/newDish/CreateCategoryModal";
import {
  CreateProductFormState,
  ProductSubCategory,
} from "@/src/lib/partner/productTypes";
import { validateStep1 } from "@/src/lib/partner/productUtils";
import { useRouter } from "next/navigation";
import { updateMarketProductAction } from "@/src/components/features/partner/dashboard/market/editProduct/actions";

type Props = {
  productId: string;
  initialSubCategories: ProductSubCategory[];
  initialFormData: CreateProductFormState;
};

/**
 * MarketEditProductForm
 * Reutiliza el mismo componente de Step1 (NewDishStep1) que la creación, pero:
 * - Precarga valores desde la BD (pasados vía props)
 * - Al guardar ejecuta una server action para actualizar el producto
 * - Mantiene la UX consistente con la página de creación
 */
export default function MarketEditProductForm({
  productId,
  initialSubCategories,
  initialFormData,
}: Props) {
  const router = useRouter();
  const [subCategories, setSubCategories] =
    useState<ProductSubCategory[]>(initialSubCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorsStep1, setErrorsStep1] = useState<Record<string, string>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [formData, setFormData] =
    useState<CreateProductFormState>(initialFormData);

  const updateFormData = (patch: Partial<CreateProductFormState>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const submitIfValid = useCallback(async () => {
    const issues = validateStep1(formData);
    if (issues.length) {
      const mapped: Record<string, string> = {};
      issues.forEach((i) => (mapped[i.field] = i.message));
      setErrorsStep1(mapped);
      return;
    }
    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("basePrice", formData.basePrice);
      data.append("description", formData.description);
      data.append("subCategoryId", formData.subCategoryId || "");
      data.append("unit", formData.unit);
      data.append("estimatedTimeRange", formData.estimatedTimeRange);
      if (formData.previousPrice)
        data.append("previousPrice", formData.previousPrice);
      if (formData.discountPercent)
        data.append("discountPercent", formData.discountPercent);
      data.append("isAvailable", String(formData.isAvailable));
      data.append("taxIncluded", String(formData.taxIncluded));
      if (formData.image instanceof File) data.append("image", formData.image);
      // market: no secciones
      data.append("sections", JSON.stringify([]));

      await updateMarketProductAction(productId, data);
      router.push(`/partner/market/productos?updated=${productId}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router, productId]);

  return (
    <>
      <NewDishStep1
        onPreview={() => {
          // Para market la vista de previsualización es innecesaria; guardamos directamente
          submitIfValid();
        }}
        onGoBack={() => router.push("/partner/market/productos")}
        formData={formData}
        updateFormData={updateFormData}
        onNextStep={submitIfValid}
        subCategories={subCategories}
        errors={errorsStep1}
        openCreateCategoryModal={() => setShowCategoryModal(true)}
        onSaveAndExit={submitIfValid}
        isSubmitting={isSubmitting}
      />

      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCreated={(sc) => {
          setSubCategories((prev) => [...prev, sc]);
          setFormData((prev) => ({ ...prev, subCategoryId: sc.id }));
        }}
      />
    </>
  );
}
