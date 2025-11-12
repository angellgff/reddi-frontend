"use client";

import { useCallback, useMemo, useState } from "react";
import NewDishStep1 from "@/src/components/features/partner/dashboard/menu/newDish/NewDishStep1";
import CreateCategoryModal from "@/src/components/features/partner/dashboard/menu/newDish/CreateCategoryModal";
import {
  CreateProductFormState,
  ProductSubCategory,
} from "@/src/lib/partner/productTypes";
import { validateStep1 } from "@/src/lib/partner/productUtils";
import { createMarketProductAction } from "./actions";
import { useRouter } from "next/navigation";

type Props = {
  initialSubCategories: ProductSubCategory[];
};

/**
 * MarketNewProductForm
 * Single-step product creation for Market partners.
 * Reuses the exact Step 1 UI from the restaurant flow (NewDishStep1),
 * without extras/sections. On submit it creates the product directly.
 *
 * Assumptions:
 * - Market uses the same "products" and "sub_categories" schema as restaurant.
 * - No extras are offered for market products, so sections array is empty.
 */
export default function MarketNewProductForm({ initialSubCategories }: Props) {
  const router = useRouter();
  const [subCategories, setSubCategories] =
    useState<ProductSubCategory[]>(initialSubCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorsStep1, setErrorsStep1] = useState<Record<string, string>>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [formData, setFormData] = useState<CreateProductFormState>({
    image: null,
    name: "",
    basePrice: "",
    previousPrice: "",
    discountPercent: "",
    unit: "",
    estimatedTimeRange: "",
    description: "",
    subCategoryId: initialSubCategories[0]?.id || null,
    isAvailable: true,
    taxIncluded: false,
    sections: [], // market: no extras, keep empty
  });

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
      if (formData.image) data.append("image", formData.image);
      // market: force empty sections
      data.append("sections", JSON.stringify([]));

      const { productId } = await createMarketProductAction(data);
      router.push(`/partner/market/productos?created=${productId}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  return (
    <>
      <NewDishStep1
        onPreview={() => {
          // Create draft in sessionStorage and navigate to preview
          const draftId = crypto.randomUUID();
          if (typeof window !== "undefined") {
            const draftPayload = {
              ...formData,
              imageObjectUrl:
                formData.image instanceof File
                  ? URL.createObjectURL(formData.image)
                  : (formData.image as any),
            };
            try {
              sessionStorage.setItem(
                `marketPreview:${draftId}`,
                JSON.stringify(draftPayload)
              );
            } catch {}
          }
          // pass only productId if exists (creation: none) and draft id
          const params = new URLSearchParams();
          params.set("draft", draftId);
          router.push(`/partner/market/productos/preview?${params.toString()}`);
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
