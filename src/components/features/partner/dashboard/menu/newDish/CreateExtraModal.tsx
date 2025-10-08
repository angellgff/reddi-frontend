"use client";
import { useEffect, useState } from "react";
import Portal from "@/src/components/basics/Portal";
import BasicInput from "@/src/components/basics/BasicInput";
import Spinner from "@/src/components/basics/Spinner";
import { createExtraAction } from "./actions";
import { ProductExtra } from "@/src/lib/partner/productTypes";

interface CreateExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (extra: ProductExtra) => void;
}

function CreateExtraModal({
  isOpen,
  onClose,
  onCreated,
}: CreateExtraModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const el = document.getElementById(
          "new-extra-name"
        ) as HTMLInputElement | null;
        el?.focus();
      }, 30);
    } else {
      setName("");
      setPrice("");
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
    const n = name.trim();
    if (!n) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!price.trim()) {
      setError("El precio por defecto es obligatorio");
      return;
    }
    const numeric = Number(price);
    if (isNaN(numeric) || numeric < 0) {
      setError("Precio inválido");
      return;
    }
    try {
      setLoading(true);
      const created = await createExtraAction({
        name: n,
        defaultPrice: numeric,
      });
      onCreated(created);
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
        aria-labelledby="create-extra-title"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="create-extra-title" className="text-xl font-semibold mb-4">
            Crear nuevo extra
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <BasicInput
              id="new-extra-name"
              label="Nombre"
              placeholder="Ej. Queso extra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={error && !name.trim() ? error : undefined}
            />
            <BasicInput
              id="new-extra-price"
              label="Precio por defecto"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              error={error && name.trim() && !price.trim() ? error : undefined}
            />
            {error &&
              !/(^$)|(^\d+(\.\d+)?$)/.test(price) &&
              price.trim() !== "" && (
                <p className="text-red-600 text-xs">Precio inválido</p>
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
                {loading && <Spinner className="h-4 w-4" />} Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

export { CreateExtraModal }; // named export only
