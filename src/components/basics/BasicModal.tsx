"use client";

import Portal from "@/src/components/basics/Portal";
import React, { useEffect, useRef } from "react";

type BasicModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  usePortal?: boolean;
};

export default function BasicModal({
  open,
  onClose,
  children,
  title,
  className = "max-w-md",
  usePortal = true,
}: BasicModalProps) {
  const backdropPointerDown = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto"
      role="dialog"
      aria-modal
      onPointerDown={(e) => {
        backdropPointerDown.current = e.target === e.currentTarget;
      }}
      onPointerUp={(e) => {
        const releasedOnBackdrop = e.target === e.currentTarget;
        if (backdropPointerDown.current && releasedOnBackdrop) {
          onClose();
        }
        backdropPointerDown.current = false;
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full relative z-[1201] pointer-events-auto overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            type="button"
          >
            <span className="sr-only">Cerrar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 18 18" />
            </svg>
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  if (!usePortal) {
    return modalContent;
  }

  return <Portal>{modalContent}</Portal>;
}
