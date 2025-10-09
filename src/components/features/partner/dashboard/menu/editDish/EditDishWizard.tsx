"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NewDishStep1 from "../newDish/NewDishStep1";
import NewDishStep2 from "../newDish/NewDishStep2";
import PreviewPageFinal from "../newDish/PreviewPageFinal";
import {
  CreateProductFormState,
  ProductSubCategory,
  ProductExtra,
} from "@/src/lib/partner/productTypes";
import { validateStep1, validateStep2 } from "@/src/lib/partner/productUtils";
import { updateDishAction } from "../newDish/actions";
import CreateCategoryModal from "../newDish/CreateCategoryModal";
import { CreateExtraModal } from "../newDish/CreateExtraModal";

interface EditDishWizardProps {
  dishId: string;
  initialDishData: CreateProductFormState;
  initialSubCategories: ProductSubCategory[];
  extrasCatalog: ProductExtra[];
}

export default function EditDishWizard({
  dishId,
  initialDishData,
  initialSubCategories,
  extrasCatalog: initialExtrasCatalog,
}: EditDishWizardProps) {
  const basePath = `/aliado/menu/editar/${dishId}`;
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step") || "1";

  const [formData, setFormData] =
    useState<CreateProductFormState>(initialDishData);
  const [subCategories, setSubCategories] =
    useState<ProductSubCategory[]>(initialSubCategories);
  const [extras, setExtras] = useState<ProductExtra[]>(initialExtrasCatalog);

  const [errorsStep1, setErrorsStep1] = useState<Record<string, string>>({});
  const [errorsStep2, setErrorsStep2] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [pendingExtraTarget, setPendingExtraTarget] = useState<{
    sectionId: string;
    optionId: string;
  } | null>(null);

  const handleSectionsChange = (
    newSections: CreateProductFormState["sections"]
  ) => {
    setFormData((prev) => ({ ...prev, sections: newSections }));
  };

  const updateFormData = (newData: Partial<CreateProductFormState>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNextStep1 = () => {
    const issues = validateStep1(formData);
    setErrorsStep1(
      issues.reduce((acc, i) => ({ ...acc, [i.field]: i.message }), {})
    );
    if (issues.length === 0) {
      router.push(`${basePath}?step=2`);
    }
  };

  const handleNextStep2 = () => {
    const issues = validateStep2(formData);
    setErrorsStep2(
      issues.reduce((acc, i) => ({ ...acc, [i.field]: i.message }), {})
    );
    if (issues.length === 0) {
      router.push(`${basePath}?step=preview`);
    }
  };

  useEffect(() => {
    if (currentStep !== "1" && validateStep1(formData).length > 0) {
      router.replace(`${basePath}?step=1`);
    }
  }, [currentStep, formData, router, basePath]);

  const handleSubmitAll = useCallback(async () => {
    setSubmitError(null);
    const s1 = validateStep1(formData);
    const s2 = validateStep2(formData);
    if (s1.length || s2.length) {
      setErrorsStep1(
        s1.reduce((acc, i) => ({ ...acc, [i.field]: i.message }), {})
      );
      setErrorsStep2(
        s2.reduce((acc, i) => ({ ...acc, [i.field]: i.message }), {})
      );
      router.push(`${basePath}?step=1`);
      return;
    }
    try {
      setIsSubmitting(true);
      const data = new FormData();
      // Llenar FormData (exactamente como en NewDishWizard)
      data.append("name", formData.name);
      data.append("basePrice", formData.basePrice);
      // ... (añade todos los demás campos)
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
      if (formData.image instanceof File) {
        data.append("image", formData.image);
      }
      data.append("sections", JSON.stringify(formData.sections));

      // Llamar a la server action de ACTUALIZACIÓN
      await updateDishAction(dishId, data);
      router.push(`/aliado/menu?updated=${dishId}`);
    } catch (e: any) {
      setSubmitError(e.message || "Error inesperado al actualizar.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router, dishId, basePath]);

  // Renderizado condicional idéntico a NewDishWizard
  switch (currentStep) {
    case "1":
      return (
        <>
          <NewDishStep1
            onPreview={() => router.push(`${basePath}?step=preview`)}
            onGoBack={() => router.push("/aliado/menu")}
            formData={formData}
            updateFormData={updateFormData}
            onNextStep={handleNextStep1}
            subCategories={subCategories}
            errors={errorsStep1}
            openCreateCategoryModal={() => setShowCategoryModal(true)}
            onSaveAndExit={handleSubmitAll} // Reutilizamos la misma lógica
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
    case "2":
      return (
        <>
          <NewDishStep2
            onPreview={() => router.push(`${basePath}?step=preview`)}
            onGoBack={() => router.push(`${basePath}?step=1`)}
            sections={formData.sections}
            onSectionsChange={handleSectionsChange}
            onNextStep={handleNextStep2}
            extrasCatalog={extras}
            errors={errorsStep2}
            onRequestCreateExtra={(sectionId, optionId) => {
              setPendingExtraTarget({ sectionId, optionId });
              setShowExtraModal(true);
            }}
            onSaveAndExit={handleSubmitAll}
            isSubmitting={isSubmitting}
          />
          <CreateExtraModal
            isOpen={showExtraModal}
            onClose={() => {
              setShowExtraModal(false);
              setPendingExtraTarget(null);
            }}
            onCreated={(extra: ProductExtra) => {
              setExtras((prev) => [...prev, extra]);
              if (pendingExtraTarget) {
                setFormData((prev) => ({
                  ...prev,
                  sections: prev.sections.map((sec) =>
                    sec.clientId === pendingExtraTarget.sectionId
                      ? {
                          ...sec,
                          options: sec.options.map((opt) =>
                            opt.clientId === pendingExtraTarget.optionId
                              ? { ...opt, extraId: extra.id }
                              : opt
                          ),
                        }
                      : sec
                  ),
                }));
              }
              setPendingExtraTarget(null);
              setShowExtraModal(false);
            }}
          />
        </>
      );
    case "preview":
      return (
        <PreviewPageFinal
          formData={formData}
          onSubmitAll={handleSubmitAll}
          submitting={isSubmitting}
          submitError={submitError}
          extrasCatalog={extras}
          subCategories={subCategories}
        />
      );
    default:
      return null;
  }
}
