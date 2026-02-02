"use client";

import { useEffect, useState } from "react";
import Portal from "@/src/components/basics/Portal";
import BasicInput from "@/src/components/basics/BasicInput";
import Spinner from "@/src/components/basics/Spinner";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import { uploadFile } from "@/src/lib/storage/uploadFile";
import {
  createCategoryAction,
  updateCategoryAction,
  PartnerCategory,
} from "@/src/app/partner/(session)/restaurant/categorias/actions";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { id: string; name: string }) => void;
  category?: PartnerCategory;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: CategoryModalProps) {
  const isEdit = !!category;
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || "");
      setImageFile(null);
      setError(null);
      setTimeout(() => {
        const el = document.getElementById(
          "category-name-input"
        ) as HTMLInputElement | null;
        el?.focus();
      }, 50);
    }
  }, [isOpen, category]);

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

      let imageUrl: string | null | undefined = category?.imageUrl;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, "categories", "sub-categories");
      }

      let result: { id: string; name: string };
      if (isEdit && category) {
        result = await updateCategoryAction(category.id, trimmed, imageUrl);
      } else {
        result = await createCategoryAction(trimmed, imageUrl);
      }

      onSuccess(result);
      onClose();
    } catch (e: unknown) {
      setError((e as Error).message || "Error al guardar");
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
        aria-labelledby="category-modal-title"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="category-modal-title" className="text-xl font-semibold mb-4">
            {isEdit ? "Editar categoría" : "Crear nueva categoría"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <BasicInput
              id="category-name-input"
              label="Nombre"
              placeholder="Ej. Bebidas frías"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={error || undefined}
            />
            <FileUploadZone
              id="category-image-upload"
              label="Imagen (Opcional)"
              acceptedFileTypes="image"
              onFileChange={setImageFile}
              value={imageFile}
            />
            {category?.imageUrl && !imageFile && (
              <p className="text-sm text-gray-500">
                La imagen actual se mantendrá si no subes una nueva.
              </p>
            )}
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
                {loading && <Spinner className="h-4 w-4" />}
                {isEdit ? "Guardar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
