"use client";

import Portal from "@/src/components/basics/Portal";
import useBodyScrollLock from "@/src/lib/hooks/useScrollBodyLock";
import { useEffect } from "react";

type CartSliderProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CartSlider({ isOpen, onClose }: CartSliderProps) {
  useBodyScrollLock(isOpen);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-50 ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Panel deslizante desde la derecha */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-panel-title"
          className={`absolute right-0 top-0 h-full w-full md:w-[480px] lg:w-[560px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 id="cart-panel-title" className="text-lg font-semibold">
              Tu carrito
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="p-2 rounded-full hover:bg-black/10"
            >
              {/* Simple icono de cerrar (X) inline para evitar dependencias nuevas */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className="text-gray-700"
              >
                <path
                  d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4">
            {/* Placeholder de contenido del carrito */}
            <div className="text-sm text-gray-600">
              Tu carrito está vacío por ahora.
            </div>
          </main>

          {/* Footer */}
          <footer className="p-4 border-t border-gray-200">
            <button
              type="button"
              className="w-full bg-primary text-white font-medium py-3 rounded-xl disabled:opacity-60"
              disabled
            >
              Ir a pagar
            </button>
          </footer>
        </aside>
      </div>
    </Portal>
  );
}
