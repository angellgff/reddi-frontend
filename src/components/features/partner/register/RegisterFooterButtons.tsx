"use client";

import React from "react";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/src/components/icons/ArrowRightIcon";

// --- DEFINICIÓN DE PROPS ---
type FooterButtonsProps = {
  onGoBack: () => void;
  onSubmit: (e: React.FormEvent<HTMLButtonElement>) => void; // onSubmit puede recibir el evento
  backText?: string;
  nextText?: string;
  isSubmitting?: boolean;
};

export default function FooterButtons({
  onGoBack,
  onSubmit,
  backText = "Volver",
  nextText = "Siguiente",
  isSubmitting = false,
}: FooterButtonsProps) {
  return (
    <div className="mt-9 flex w-full items-center justify-between border-t border-white/40 py-10">
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-[#202124] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onGoBack}
        disabled={isSubmitting}
      >
        <ArrowLeftIcon fill="#202124" />
        {backText}
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          className="h-11 rounded-xl border border-[#202124] bg-white px-5 text-sm font-medium text-[#202124] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Guardar y salir
        </button>

        <button
          type="submit"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#595959] px-5 text-sm font-medium text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : nextText}
          {!isSubmitting && <ArrowRightIcon fill="#ffffff" />}
        </button>
      </div>
    </div>
  );
}
