"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NewDishStep1 from "./NewDishStep1";
import NewDishStep2 from "./NewDishStep2";
import PreviewPageFinal from "./PreviewPageFinal";
import {
  CreateProductFormState,
  ProductSubCategory,
  ProductExtra,
} from "@/src/lib/partner/productTypes";
import {
  buildCreateProductPayload,
  validateStep1,
  validateStep2,
} from "@/src/lib/partner/productUtils";
import { createDishAction } from "./actions";
import CreateCategoryModal from "./CreateCategoryModal";
// Using named import to mitigate transient module resolution issue with default import
import { CreateExtraModal } from "./CreateExtraModal";

const basePath = "/aliado/menu/nuevo";

/*const categoryOptions = [
  { id: "entrantes", name: "Entrantes" },
  { id: "plato-fuerte", name: "Plato Fuerte" },
  { id: "postres", name: "Postres" },
  { id: "bebidas", name: "Bebidas" },
];*/

interface NewDishWizardProps {
  initialSubCategories: ProductSubCategory[];
  extrasCatalog: ProductExtra[]; // catálogo inicial
}

export default function NewDishWizard({
  initialSubCategories,
  extrasCatalog: initialExtrasCatalog,
}: NewDishWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step") || "1";
  const [subCategories, setSubCategories] =
    useState<ProductSubCategory[]>(initialSubCategories);
  const [extras, setExtras] = useState<ProductExtra[]>(initialExtrasCatalog);
  const [formData, setFormData] = useState<CreateProductFormState>({
    image: null,
    name: "",
    basePrice: "",
    previousPrice: "",
    discountPercent: "",
    unit: "",
    estimatedTimeRange: "",
    description: "",
    subCategoryId: subCategories[0]?.id || null,
    isAvailable: true,
    taxIncluded: false,
    sections: [],
  });
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

  // Actualiza cualquier campo del formulario
  const updateFormData = (newData: Partial<CreateProductFormState>) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  // Función para el botón siguiente en el Step1
  const handleNextStep1 = () => {
    const issues = validateStep1(formData);
    const mapped: Record<string, string> = {};
    issues.forEach((i) => (mapped[i.field] = i.message));
    setErrorsStep1(mapped);
    if (issues.length === 0) {
      router.push(`${basePath}?step=2`);
    }
  };

  const handleNextStep2 = () => {
    const issues = validateStep2(formData);
    const mapped: Record<string, string> = {};
    issues.forEach((i) => (mapped[i.field] = i.message));
    setErrorsStep2(mapped);
    if (issues.length === 0) {
      router.push(`${basePath}?step=preview`);
    }
  };

  // Efecto para validar el paso actual y los campos requeridos
  useEffect(() => {
    const validSteps = ["1", "2", "preview"];
    if (!validSteps.includes(currentStep)) {
      router.replace(`${basePath}?step=1`);
      return;
    }
    if (currentStep !== "1") {
      const s1Issues = validateStep1(formData);
      if (s1Issues.length) {
        router.replace(`${basePath}?step=1`);
      }
    }
  }, [currentStep, formData, router]);

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
      router.push(`${basePath}?step=1`); // fallback
      return;
    }
    try {
      setIsSubmitting(true);
      const data = new FormData();

      // 2. Añadir todos los campos del formulario
      // Campos de texto
      data.append("name", formData.name);
      data.append("basePrice", formData.basePrice);
      data.append("description", formData.description);
      data.append("subCategoryId", formData.subCategoryId || "");
      data.append("unit", formData.unit);
      data.append("estimatedTimeRange", formData.estimatedTimeRange);
      if (formData.previousPrice) {
        data.append("previousPrice", formData.previousPrice);
      }
      if (formData.discountPercent) {
        data.append("discountPercent", formData.discountPercent);
      }

      // Campos booleanos (convertidos a string)
      data.append("isAvailable", String(formData.isAvailable));
      data.append("taxIncluded", String(formData.taxIncluded));

      // El archivo de imagen (si existe)
      if (formData.image) {
        data.append("image", formData.image);
      }

      // Objetos/Arrays complejos se convierten a string JSON
      data.append("sections", JSON.stringify(formData.sections));

      // 3. Llamar a la server action con el FormData
      const { productId } = await createDishAction(data);

      router.push(`/aliado/menu?created=${productId}`);
    } catch (e: any) {
      setSubmitError(e.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  const handleSaveAndExit = useCallback(async () => {
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
      // En caso de errores, vuelve al primer paso con errores
      router.push(`${basePath}?step=1`);
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
      if (formData.previousPrice) {
        data.append("previousPrice", formData.previousPrice);
      }
      if (formData.discountPercent) {
        data.append("discountPercent", formData.discountPercent);
      }
      data.append("isAvailable", String(formData.isAvailable));
      data.append("taxIncluded", String(formData.taxIncluded));
      if (formData.image) {
        data.append("image", formData.image);
      }
      data.append("sections", JSON.stringify(formData.sections));
      const { productId } = await createDishAction(data);
      router.push(`/aliado/menu?created=${productId}`);
    } catch (e: any) {
      setSubmitError(e.message || "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  // Guardias para renderizar el paso correcto o nada
  if (!["1", "2", "preview"].includes(currentStep || "")) {
    return null;
  }

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
            onSaveAndExit={handleSaveAndExit}
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
            onRequestCreateExtra={(sectionId: string, optionId: string) => {
              setPendingExtraTarget({ sectionId, optionId });
              setShowExtraModal(true);
            }}
            onSaveAndExit={handleSaveAndExit}
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
