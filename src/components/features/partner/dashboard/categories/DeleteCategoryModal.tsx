"use client";

import { useState } from "react";
import Portal from "@/src/components/basics/Portal";
import Spinner from "@/src/components/basics/Spinner";
import {
  deleteCategoryAction,
  PartnerCategory,
} from "@/src/app/partner/(session)/restaurant/categorias/actions";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
  category?: PartnerCategory;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  onDeleted,
  category,
}: DeleteCategoryModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    setError(null);
    try {
      setLoading(true);
      await deleteCategoryAction(category.id);
      onDeleted(category.id);
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message || "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  const hasProducts = category.productCount > 0;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-category-title"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id="delete-category-title"
            className="text-xl font-semibold mb-2"
          >
            Eliminar categoría
          </h2>

          <p className="text-gray-600 mb-4">
            ¿Estás seguro de que deseas eliminar la categoría{" "}
            <span className="font-semibold">&quot;{category.name}&quot;</span>?
          </p>

          {hasProducts && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Esta categoría tiene productos
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Hay {category.productCount} producto
                    {category.productCount !== 1 && "s"} asociado
                    {category.productCount !== 1 && "s"} a esta categoría. Debes
                    reasignarlos o eliminarlos antes de poder eliminar la
                    categoría.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-red-700 flex items-center gap-2"
              disabled={loading || hasProducts}
            >
              {loading && <Spinner className="h-4 w-4" />}
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
