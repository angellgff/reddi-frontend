"use client";
import { useEffect, useState } from "react";
import Portal from "@/src/components/basics/Portal";
import BasicInput from "@/src/components/basics/BasicInput";
import Spinner from "@/src/components/basics/Spinner";
import { createSubCategoryAction } from "./actions";
import { ProductSubCategory } from "@/src/lib/partner/productTypes";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (subCat: ProductSubCategory) => void;
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onCreated,
}: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const el = document.getElementById(
          "new-category-name"
        ) as HTMLInputElement | null;
        el?.focus();
      }, 50);
    } else {
      setName("");
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre es obligatorio");
      return;
    }
    if (trimmed.length > 80) {
      setError("Máximo 80 caracteres");
      return;
    }
    try {
      setLoading(true);
      const res = await createSubCategoryAction(trimmed);
      onCreated({ id: res.id, name: res.name, categoryId: null });
      onClose();
    } catch (e: any) {
      setError(e.message || "Error al crear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-category-title"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="create-category-title" className="text-xl font-semibold mb-4">
            Crear nueva categoría
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <BasicInput
              id="new-category-name"
              label="Nombre"
              placeholder="Ej. Bebidas frías"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={error || undefined}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-100"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2"
                disabled={loading}
              >
                {loading && <Spinner className="h-4 w-4" />} Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
