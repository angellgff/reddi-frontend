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
    // 🚀 Inicia el proceso de envío
    console.group("handleSubmitAll - Proceso de Envío de Plato");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Iniciando validación y envío para el plato ID:", dishId);

    setSubmitError(null);

    // 1. Fase de Validación
    console.group("1. Fase de Validación");
    console.log("Datos del formulario a validar:", formData);

    const s1 = validateStep1(formData);
    const s2 = validateStep2(formData);

    console.log("Resultados de validación Step 1:", s1);
    console.log("Resultados de validación Step 2:", s2);
    console.groupEnd(); // Fin de Fase de Validación

    // 2. Comprobar si hay errores de validación
    if (s1.length || s2.length) {
      console.warn("❌ Validación fallida. Hay errores.");
      const errors1 = s1.reduce(
        (acc, i) => ({ ...acc, [i.field]: i.message }),
        {}
      );
      const errors2 = s2.reduce(
        (acc, i) => ({ ...acc, [i.field]: i.message }),
        {}
      );

      console.log("Errores a establecer en el estado (Step 1):", errors1);
      console.log("Errores a establecer en el estado (Step 2):", errors2);

      setErrorsStep1(errors1);
      setErrorsStep2(errors2);

      const redirectPath = `${basePath}?step=1`;
      console.log(`Redirigiendo al usuario a: ${redirectPath}`);
      router.push(redirectPath);

      console.groupEnd(); // Fin del proceso handleSubmitAll (temprano)
      return;
    }

    // 3. Si la validación es exitosa, proceder con el envío
    console.log(
      "✅ Validación exitosa. Procediendo a preparar los datos para el envío."
    );

    try {
      setIsSubmitting(true);
      console.group("2. Fase de Envío (API Call)");

      // Preparar FormData
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
      if (formData.image instanceof File) {
        data.append("image", formData.image);
      }
      data.append("sections", JSON.stringify(formData.sections));

      // Loggear el contenido de FormData (no se puede loggear directamente)
      console.log("Contenido de FormData que se enviará:");
      for (let [key, value] of data.entries()) {
        // Para el archivo, solo mostramos su nombre para no llenar la consola
        if (value instanceof File) {
          console.log(`  ${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type,
          });
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      // Llamar a la server action
      console.log(`Llamando a 'updateDishAction' con dishId: ${dishId}`);
      await updateDishAction(dishId, data);
      console.log("✅ Server action 'updateDishAction' completada con éxito.");

      const successPath = `/aliado/menu?updated=${dishId}`;
      console.log(`Redirigiendo a la página de éxito: ${successPath}`);
      router.push(successPath);
    } catch (e: any) {
      // Manejo de errores
      console.error("🔴 ERROR durante el envío a la server action:", e);
      const errorMessage = e.message || "Error inesperado al actualizar.";
      console.log("Estableciendo mensaje de error en el estado:", errorMessage);
      setSubmitError(errorMessage);
    } finally {
      // Limpieza
      console.log(
        "Ejecutando el bloque 'finally'. Finalizando el estado de envío."
      );
      setIsSubmitting(false);
      console.groupEnd(); // Fin de Fase de Envío (API Call)
      console.groupEnd(); // Fin del proceso handleSubmitAll
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
