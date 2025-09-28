"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSomeFieldsMissing } from "@/src/lib/partner/utils";
import NewDishStep1 from "../newDish/NewDishStep1";
import NewDishStep2 from "../newDish/NewDishStep2";
import PreviewPage from "../newDish/PreviewPage";
import { IDishFormState } from "../newDish/NewDishWizard";

export type dishOption = {
  id: string;
  name: string;
  extraPrice: string;
  image: File | null;
};

export type dishSection = {
  id: string;
  name: string;
  isRequired: boolean;
  options: dishOption[];
};

const requiredFieldsStep1: (keyof IDishFormState)[] = [
  "image",
  "dishName",
  "basePrice",
  "unit",
  "estimatedTime",
  "description",
  "category",
];

interface EditDishWizardProps {
  id: string;
  data: IDishFormState;
}

export default function EditDishWizard({ id, data }: EditDishWizardProps) {
  const actualUrl = `/aliado/menu/editar/${id}`;
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step") || "1";

  const [formData, setFormData] = useState<IDishFormState>(data);

  // Maneja los cambios en NewDishStep2
  const handleSectionsChange = (newSections: dishSection[]) => {
    setFormData((prev) => ({
      ...prev,
      dishSections: newSections,
    }));
  };

  // Actualiza cualquier campo del formulario
  const updateFormData = (newData: Partial<IDishFormState>) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  // Función para el botón siguiente en el Step1
  const handleNextStep1 = () => {
    router.push(`${actualUrl}?step=2`);
  };

  const handleNextStep2 = () => {
    // Esta función será un action para enviar el formulario, se hará en un server component que verificará
    // todos los datos y después los enviará al backend o avisará al usuario que algo está mal.
    window.alert(
      "No implementado aún, buscar handleNextStep2 en NewDishWizard.tsx"
    );
  };

  // Efecto para validar el paso actual y los campos requeridos
  useEffect(() => {
    const validSteps = ["1", "2", "preview"];
    const requiredFieldsStep1: (keyof IDishFormState)[] = [
      "image",
      "dishName",
      "basePrice",
      "unit",
      "estimatedTime",
      "description",
      "category",
    ];

    // Verifica que se esté en un paso válido
    if (!validSteps.includes(currentStep || "")) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
    // Si se intenta acceder al paso 2 o a la vista previa sin haber completado el paso 1 redirige al paso 1
    if (
      (currentStep === "2" || currentStep === "preview") &&
      isSomeFieldsMissing(requiredFieldsStep1, formData)
    ) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
  }, [currentStep, router, formData, actualUrl]);

  // Guardias para renderizar el paso correcto o nada
  if (!["1", "2", "preview"].includes(currentStep || "")) {
    return null;
  }

  if (
    (currentStep === "2" || currentStep === "preview") &&
    isSomeFieldsMissing(requiredFieldsStep1, formData)
  ) {
    return null;
  }

  switch (currentStep) {
    case "1":
      return (
        <NewDishStep1
          onPreview={() => router.push(`${actualUrl}?step=preview`)}
          onGoBack={() => router.push("/aliado/menu")}
          formData={formData}
          requiredFields={requiredFieldsStep1}
          updateFormData={updateFormData}
          onNextStep={handleNextStep1}
        />
      );
    case "2":
      return (
        <NewDishStep2
          onPreview={() => router.push(`${actualUrl}?step=preview`)}
          onGoBack={() => router.push(`${actualUrl}?step=1`)}
          sections={formData.dishSections}
          onSectionsChange={handleSectionsChange}
          onNextStep={handleNextStep2}
        />
      );
    case "preview":
      return <PreviewPage formData={formData} />;
    default:
      return null;
  }
}
