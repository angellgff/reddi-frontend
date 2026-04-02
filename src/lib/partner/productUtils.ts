import {
  CreateProductFormState,
  CreateProductPayload,
  ProductSectionForm,
} from "./productTypes";

const TIME_RANGE_REGEX = /^(\d{1,2})-(\d{1,2})min$/;
const POSITIVE_NUMBER_REGEX = /^(0|[1-9]\d*)(\.\d+)?$/;

export function parseEstimatedRange(range: string): string | null {
  if (!TIME_RANGE_REGEX.test(range)) return null;
  return range; // La BD guarda string estimated_time directamente
}

export function toNumberOrNull(v: string): number | null {
  if (!v) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export function isPositiveNumberString(v: string): boolean {
  if (!v) return true; // vacío permitido en algunos campos
  return POSITIVE_NUMBER_REGEX.test(v);
}

export function buildCreateProductPayload(
  form: CreateProductFormState,
): CreateProductPayload {
  const selectedIds = form.subCategoryIds?.length
    ? form.subCategoryIds
    : form.subCategoryId
      ? [form.subCategoryId]
      : [];

  if (selectedIds.length === 0) {
    throw new Error("La categoría (sub-categoría) es obligatoria");
  }
  const estimated = parseEstimatedRange(form.estimatedTimeRange);
  if (!estimated) throw new Error("Formato de tiempo estimado inválido");

  const sectionsPayload = form.sections.map((sec, sIdx) =>
    sectionToPayload(sec, sIdx),
  );

  return {
    product: {
      name: form.name.trim(),
      basePrice: Number(form.basePrice),
      previousPrice: toNumberOrNull(form.previousPrice),
      discountPercentage: toNumberOrNull(form.discountPercent),
      unit: form.measurementUnit, // Legacy field filled with measurementUnit
      measurementUnit: form.measurementUnit,
      minQuantity:
        form.measurementUnit === "unit" ? 1 : Number(form.minQuantity),
      quantityStep:
        form.measurementUnit === "unit" ? 1 : Number(form.quantityStep),
      estimatedTime: estimated,
      description: form.description.trim() || null,
      subCategoryIds: selectedIds,
      isAvailable: form.isAvailable,
      taxIncluded: form.taxIncluded,
    },
    sections: sectionsPayload,
  };
}

function sectionToPayload(section: ProductSectionForm, order: number) {
  return {
    tempId: section.clientId,
    name: section.name.trim(),
    isRequired: section.isRequired,
    order,
    options: section.options
      .filter((o) => o.extraId)
      .map((opt, oIdx) => ({
        extraId: opt.extraId!,
        overridePrice: opt.overridePrice ? Number(opt.overridePrice) : null,
        order: oIdx,
      })),
  };
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export function validateStep1(form: CreateProductFormState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const required: Array<keyof CreateProductFormState> = [
    "name",
    "basePrice",
    "measurementUnit",
    "estimatedTimeRange",
    "description",
  ];
  required.forEach((f) => {
    const val = form[f];
    if (typeof val === "string" && !val.trim()) {
      issues.push({ field: f, message: "Este campo es obligatorio" });
    }
  });

  // Validaciones para minQuantity y quantityStep si no es 'unit'
  if (form.measurementUnit !== "unit") {
    if (!isPositiveNumberString(form.minQuantity)) {
      issues.push({ field: "minQuantity", message: "Requerido" });
    }
    if (!isPositiveNumberString(form.quantityStep)) {
      issues.push({ field: "quantityStep", message: "Requerido" });
    }
  }

  const selectedIds = form.subCategoryIds?.length
    ? form.subCategoryIds
    : form.subCategoryId
      ? [form.subCategoryId]
      : [];

  if (selectedIds.length === 0) {
    issues.push({
      field: "subCategoryIds",
      message: "Seleccione al menos una categoría",
    });
  }
  if (!isPositiveNumberString(form.basePrice)) {
    issues.push({ field: "basePrice", message: "Número inválido" });
  }
  ["previousPrice", "discountPercent"].forEach((f) => {
    const v = form[f as keyof CreateProductFormState];
    if (typeof v === "string" && v && !isPositiveNumberString(v)) {
      issues.push({ field: f, message: "Número inválido" });
    }
  });
  if (!parseEstimatedRange(form.estimatedTimeRange)) {
    issues.push({
      field: "estimatedTimeRange",
      message: "Formato esperado 10-20min",
    });
  }
  if (form.description.length > 250) {
    issues.push({ field: "description", message: "Máximo 250 caracteres" });
  }
  return issues;
}

export function validateStep2(form: CreateProductFormState): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  form.sections.forEach((section) => {
    if (!section.name.trim()) {
      issues.push({
        field: `section-${section.clientId}-name`,
        message: "Nombre requerido",
      });
    }
    const seen = new Set<string>();
    section.options.forEach((opt) => {
      if (!opt.extraId) {
        issues.push({
          field: `option-${opt.clientId}-extra`,
          message: "Seleccione un extra",
        });
      } else if (seen.has(opt.extraId)) {
        issues.push({
          field: `option-${opt.clientId}-extra`,
          message: "Extra repetido",
        });
      } else {
        seen.add(opt.extraId);
      }
      if (opt.overridePrice && !isPositiveNumberString(opt.overridePrice)) {
        issues.push({
          field: `option-${opt.clientId}-overridePrice`,
          message: "Precio inválido",
        });
      }
    });
  });
  return issues;
}
