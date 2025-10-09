"use client";

import FooterButtons from "@/src/components/basics/FooterButtons";
import BasicInput from "@/src/components/basics/BasicInput";
import Checkbox from "@/src/components/basics/CheckBox";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import SelectInput from "@/src/components/basics/SelectInput";
import TextArea from "@/src/components/features/partner/TextArea";
import InputNotice from "@/src/components/basics/InputNotice";
import {
  CreateProductFormState,
  ProductSubCategory,
} from "@/src/lib/partner/productTypes";
import { useState, useRef } from "react";
import { isFieldInvalid } from "@/src/lib/partner/utils";

const POSITIVE_NUMBER_REGEX = /^(0|[1-9]\d*)(\.\d+)?$/;
const ESTIMATED_TIME_REGEX = /^\d{1,2}-\d{1,2}?min$/;
const LIMIT_DESCRIPTION_LENGTH = 250;

const mustBeNumber: Array<keyof CreateProductFormState> = [
  "basePrice",
  "previousPrice",
  "discountPercent",
];

interface NewDishStep1Props {
  formData: CreateProductFormState;
  updateFormData: (newData: Partial<CreateProductFormState>) => void;
  onGoBack: () => void;
  onNextStep: () => void;
  onPreview: () => void;
  subCategories: ProductSubCategory[];
  errors: Record<string, string>;
  openCreateCategoryModal: () => void;
  onSaveAndExit: () => void;
  isSubmitting?: boolean;
}

export default function NewDishStep1({
  formData,
  onPreview,
  updateFormData,
  onGoBack,
  onNextStep,
  subCategories,
  errors: externalErrors,
  openCreateCategoryModal,
  onSaveAndExit,
  isSubmitting,
}: NewDishStep1Props) {
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const fileUploadRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });

    // Limpieza de errores para el campo modificado
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (file: File | null) => {
    const fieldName = "image" as const;

    updateFormData({ [fieldName]: file });

    // Limpia el error para el campo de la imagen
    if (errors[fieldName]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Handler específico para checkboxes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    updateFormData({ [name]: checked });
  };

  const verifyErrors = (newErrors: Partial<Record<string, string>>) => {
    ["name", "basePrice", "unit", "estimatedTimeRange", "description"].forEach(
      (f) => {
        const val = (formData as any)[f];
        if (!val || (typeof val === "string" && !val.trim())) {
          newErrors[f] = "Este campo es obligatorio";
        }
      }
    );
    if (!formData.subCategoryId) {
      newErrors["subCategoryId"] = "Seleccione una categoría";
    }
    mustBeNumber.forEach((field) => {
      const val = formData[field];
      if (val && !POSITIVE_NUMBER_REGEX.test(val as string)) {
        newErrors[field] = "Solo se permiten números positivos";
      }
    });
    if (
      formData.estimatedTimeRange &&
      !ESTIMATED_TIME_REGEX.test(formData.estimatedTimeRange)
    ) {
      newErrors.estimatedTimeRange =
        "Siga el formato XX-XXmin, ejemplo: 10-20min";
    }
    if (
      formData.description &&
      formData.description.length > LIMIT_DESCRIPTION_LENGTH
    ) {
      newErrors.description = `La descripción no puede exceder los ${LIMIT_DESCRIPTION_LENGTH} carácteres`;
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Partial<Record<string, string>> = {};
    newErrors = verifyErrors(newErrors);

    // ACTUALIZAMOS el estado de errores si encontramos alguno
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      // Se hace focus al primer campo con error
      if (firstErrorField === "image") {
        fileUploadRef.current?.focus();
      } else {
        const elementToFocus = formRef.current?.querySelector(
          `[name="${firstErrorField}"]`
        ) as HTMLElement;
        elementToFocus?.focus();
      }

      return;
    }

    // Si todo es válido, continuamos
    setErrors({}); // Limpiamos cualquier error residual
    onNextStep();
  };

  const handlePreview = () => {
    let newErrors: Partial<Record<string, string>> = {};
    newErrors = verifyErrors(newErrors);

    // ACTUALIZAMOS el estado de errores si encontramos alguno
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0];
      if (firstErrorField === "image") {
        fileUploadRef.current?.focus();
      } else {
        const elementToFocus = formRef.current?.querySelector(
          `[name="${firstErrorField}"]`
        ) as HTMLElement;
        elementToFocus?.focus();
      }
      return;
    }

    // Si todo es válido, continuamos
    setErrors({}); // Limpiamos cualquier error residual
    onPreview();
  };

  return (
    <>
      <h2 className="text-lg text-gray-900 mb-4 font-inter">
        Información Básica
      </h2>
      <form onSubmit={handleSubmit} ref={formRef} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna Izquierda: Foto */}
          <div className="lg:col-span-2">
            <FileUploadZone
              onFileChange={handleFileChange}
              value={formData.image}
              ref={fileUploadRef}
              required
            />
            {errors.image && <InputNotice variant="error" msg={errors.image} />}
          </div>

          {/* Columna Derecha: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <BasicInput
              id="name"
              label="Nombre del producto"
              placeholder="Ingresar la información"
              value={formData.name}
              onChange={handleChange}
              required
              error={errors.name || externalErrors.name}
            />

            <BasicInput
              id="basePrice"
              label="Precio base (USD)"
              placeholder="Ingresar la información"
              value={formData.basePrice}
              onChange={handleChange}
              required
              error={errors.basePrice}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <BasicInput
                id="previousPrice"
                label="Precio anterior (opcional)"
                placeholder="Ingresar la información"
                value={formData.previousPrice}
                onChange={handleChange}
                error={errors.previousPrice}
              />
              <BasicInput
                id="discountPercent"
                label="Descuento %"
                placeholder="Ingresar la información"
                value={formData.discountPercent}
                onChange={handleChange}
                error={errors.discountPercent || externalErrors.discountPercent}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <BasicInput
                id="unit"
                label="Unidad"
                placeholder="/u"
                value={formData.unit}
                onChange={handleChange}
                required
                error={errors.unit}
              />

              <BasicInput
                id="estimatedTimeRange"
                label="Tiempo estimado"
                placeholder="Ejm. 25-35 min"
                value={formData.estimatedTimeRange}
                onChange={handleChange}
                required
                error={
                  errors.estimatedTimeRange || externalErrors.estimatedTimeRange
                }
              />
            </div>

            <div>
              <TextArea
                id="description"
                name="description"
                label="Descripción"
                placeholder={`Ingrese la información, máximo ${LIMIT_DESCRIPTION_LENGTH} carácteres`}
                value={formData.description}
                onChange={handleChange}
                required
                error={errors.description}
              />
            </div>
            <div>
              <div>
                <SelectInput
                  id="subCategoryId"
                  name="subCategoryId"
                  label="Categoría"
                  placeholder="Seleccione"
                  options={[
                    {
                      value: "__create__",
                      label: "➕ Crear nueva categoría...",
                    },
                    ...subCategories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    })),
                  ]}
                  value={formData.subCategoryId || ""}
                  onChange={(e) => {
                    if (e.target.value === "__create__") {
                      openCreateCategoryModal();
                      return;
                    }
                    handleChange(e as any);
                  }}
                  getOptionValue={(option) => (option as any).value}
                  getOptionLabel={(option) => (option as any).label}
                  required
                  error={errors.subCategoryId || externalErrors.subCategoryId}
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Checkbox
                id="isAvailable"
                label="Disponible"
                checked={formData.isAvailable}
                onChange={handleCheckboxChange}
              />
              <Checkbox
                id="taxIncluded"
                label="Impuestos Incluidos"
                checked={formData.taxIncluded}
                onChange={handleCheckboxChange}
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <FooterButtons
          onGoBack={onGoBack}
          onPreview={handlePreview}
          onSaveAndExit={onSaveAndExit}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </form>
    </>
  );
}
