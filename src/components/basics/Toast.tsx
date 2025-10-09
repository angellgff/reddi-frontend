"use client";

import Portal from "@/src/components/basics/Portal";
import React, { useEffect } from "react";

type ToastProps = {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number; // ms
  onClose: () => void;
};

export default function Toast({
  open,
  message,
  type = "info",
  duration = 2500,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open) return null;

  const colorMap: Record<string, string> = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-gray-800",
  };

  return (
    <Portal>
      <div className="fixed inset-0 pointer-events-none z-[60]">
        <div className="absolute top-4 right-4 pointer-events-auto">
          <div
            className={`text-white px-4 py-3 rounded-lg shadow-lg ${colorMap[type]} max-w-sm`}
            role="status"
            aria-live="polite"
          >
            <span className="text-sm font-medium">{message}</span>
          </div>
        </div>
      </div>
    </Portal>
  );
}
