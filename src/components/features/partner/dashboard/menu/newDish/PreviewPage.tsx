"use client";
import {
  CreateProductFormState,
  ProductExtra,
  ProductSubCategory,
} from "@/src/lib/partner/productTypes";

interface PreviewPageProps {
  formData: CreateProductFormState;
  onSubmitAll: () => void;
  submitting: boolean;
  submitError: string | null;
  extrasCatalog: ProductExtra[];
  subCategories: ProductSubCategory[];
}

export default function PreviewPage({
  formData,
  onSubmitAll,
  submitting,
  submitError,
  extrasCatalog,
  subCategories,
}: PreviewPageProps) {
  const categoryName = formData.subCategoryId
    ? subCategories.find((c) => c.id === formData.subCategoryId)?.name ||
      formData.subCategoryId
    : "(sin categoría)";
  const extraName = (id: string | null) => {
    if (!id) return "(sin seleccionar)";
    return extrasCatalog.find((e) => e.id === id)?.name || id;
  };
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Vista previa</h2>
      <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
        <p>
          <strong>Nombre:</strong> {formData.name}
        </p>
        <p>
          <strong>Precio base:</strong> {formData.basePrice}
        </p>
        <p>
          <strong>Precio anterior:</strong> {formData.previousPrice || "-"}
        </p>
        <p>
          <strong>Descuento %:</strong> {formData.discountPercent || "-"}
        </p>
        <p>
          <strong>Unidad:</strong> {formData.unit}
        </p>
        <p>
          <strong>Tiempo estimado:</strong> {formData.estimatedTimeRange}
        </p>
        <p>
          <strong>Categoría:</strong> {categoryName}
        </p>
        <p>
          <strong>Disponible:</strong> {formData.isAvailable ? "Sí" : "No"}
        </p>
        <p>
          <strong>Impuestos incluidos:</strong>{" "}
          {formData.taxIncluded ? "Sí" : "No"}
        </p>
        <div>
          <strong>Secciones:</strong>
          {formData.sections.length === 0 && (
            <p className="text-gray-500">(Sin secciones)</p>
          )}
          <ul className="list-disc ml-5 space-y-1">
            {formData.sections.map((s) => (
              <li key={s.clientId}>
                <span className="font-medium">{s.name}</span>{" "}
                {s.isRequired && (
                  <span className="text-xs text-primary">(Requerido)</span>
                )}
                <ul className="list-disc ml-5 text-xs mt-1 space-y-0.5">
                  {s.options.map((o) => (
                    <li key={o.clientId}>
                      Extra: {extraName(o.extraId)}{" "}
                      {o.overridePrice && `(override $${o.overridePrice})`}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onSubmitAll}
          disabled={submitting}
          className="px-6 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          {submitting ? "Creando..." : "Crear producto"}
        </button>
      </div>
    </div>
  );
}
