"use client";

import { useCallback, useState } from "react";
import NewDishStep1 from "@/src/components/features/partner/dashboard/menu/newDish/NewDishStep1";
import {
  CreateProductFormState,
  ProductSubCategory,
  ProductTagDefinition,
} from "@/src/lib/partner/productTypes";
import { validateStep1 } from "@/src/lib/partner/productUtils";
import { createMarketProductAction } from "./actions";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/src/lib/utils";

type Props = {
  initialSubCategories: ProductSubCategory[];
  availableTags: ProductTagDefinition[];
  onCreated?: (productId: string) => void;
  onCancel?: () => void;
  returnHref?: string;
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
export default function MarketNewProductForm({
  initialSubCategories,
  availableTags,
  onCreated,
  onCancel,
  returnHref = "/partner/market/productos",
}: Props) {
  const router = useRouter();
  const [subCategories, setSubCategories] =
    useState<ProductSubCategory[]>(initialSubCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorsStep1, setErrorsStep1] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateProductFormState>({
    image: null,
    name: "",
    basePrice: "",
    previousPrice: "",
    discountPercent: "",
    measurementUnit: "unit",
    minQuantity: "1",
    quantityStep: "1",
    estimatedTimeRange: "",
    description: "",
    subCategoryId: initialSubCategories[0]?.id || null,
    isAvailable: true,
    taxIncluded: false,
    sections: [], // market: no extras, keep empty
    tags: [],
  });

  const updateFormData = (patch: Partial<CreateProductFormState>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const submitIfValid = useCallback(async () => {
    setSubmitError(null);
    const issues = validateStep1(formData);
    if (issues.length) {
      const mapped: Record<string, string> = {};
      issues.forEach((i) => (mapped[i.field] = i.message));
      setErrorsStep1(mapped);
      return;
    }
    try {
      setIsSubmitting(true);
      console.log("Submitting Market Product. Tags:", formData.tags);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("basePrice", formData.basePrice);
      data.append("description", formData.description);
      data.append("subCategoryId", formData.subCategoryId || "");
      data.append("unit", formData.measurementUnit);
      data.append("measurementUnit", formData.measurementUnit);
      data.append("minQuantity", formData.minQuantity);
      data.append("quantityStep", formData.quantityStep);
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
      data.append("tags", JSON.stringify(formData.tags || []));

      const { productId } = await createMarketProductAction(data);

      if (onCreated) {
        onCreated(productId);
        router.refresh();
        return;
      }

      router.push(
        `${returnHref}${returnHref.includes("?") ? "&" : "?"}created=${productId}`,
      );
    } catch (e: unknown) {
      setSubmitError(getErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onCreated, router, returnHref]);

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
                  : (formData.image as string),
            };
            try {
              sessionStorage.setItem(
                `marketPreview:${draftId}`,
                JSON.stringify(draftPayload),
              );
            } catch {}
          }
          // pass only productId if exists (creation: none) and draft id
          const params = new URLSearchParams();
          params.set("draft", draftId);
          router.push(`/partner/market/productos/preview?${params.toString()}`);
        }}
        onGoBack={() => {
          if (onCancel) {
            onCancel();
            return;
          }
          router.push(returnHref);
        }}
        formData={formData}
        updateFormData={updateFormData}
        onNextStep={submitIfValid}
        subCategories={subCategories}
        errors={errorsStep1}
        openCreateCategoryModal={() => {}}
        onSaveAndExit={submitIfValid}
        isSubmitting={isSubmitting}
        submitError={submitError}
        allowCreateCategory={false}
        availableTags={availableTags}
      />
    </>
  );
}
