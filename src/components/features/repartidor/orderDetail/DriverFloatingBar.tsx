"use client";

import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  mode: "slide_complete" | "proceed_pay" | "see_route";
  amount?: number;
  onAction: () => void;
  disabled?: boolean;
}

export default function DriverFloatingBar({
  mode,
  amount,
  onAction,
  disabled,
}: Props) {
  // Handlers for slide
  // Note: For simplicity in this iteration, we'll act as a button click or simple slide simulation
  // detailed drag gestures can be added if "Slide" allows partial drag.
  // For now, we will treat "Slide" as a full-width clickable or simple drag trigger.

  return (
    <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none">
      <div className="w-full max-w-[340px] h-[44px] relative pointer-events-auto">
        {/* SEE ROUTE STATE */}
        {mode === "see_route" && (
          <motion.button
            onClick={onAction}
            disabled={disabled}
            className="w-full h-full bg-[#F5A623] rounded-[25px] flex items-center justify-center px-6 shadow-lg text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-[16px]">Ver ruta en el mapa</span>
              {/* Optional: Add Map Pin Icon */}
            </div>
          </motion.button>
        )}

        {/* SLIDE COMPLETED STATE */}
        {mode === "slide_complete" && (
          <motion.div
            className="w-full h-full bg-[#04BD88] rounded-[25px] flex items-center justify-between pl-1 pr-1 relative overflow-hidden shadow-[0px_0px_29.1px_rgba(0,0,0,0.25)]"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {/* Text Background */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <span className="text-white font-bold text-[16px]">
                Desliza al completar la entrega
              </span>
            </div>

            {/* Slider Handle (Visual simulation for now) */}
            <motion.div
              className="relative z-10 w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center cursor-pointer shadow-sm"
              drag="x"
              dragConstraints={{ left: 0, right: 290 }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 150) {
                  // Threshold
                  onAction();
                }
              }}
            >
              <ChevronRight className="text-[#04BD88]" />
            </motion.div>
          </motion.div>
        )}

        {/* PROCEED TO PAY STATE */}
        {mode === "proceed_pay" && (
          <motion.button
            onClick={onAction}
            disabled={disabled}
            className="w-full h-full bg-[#CF4518] rounded-[25px] flex items-center justify-between px-6 shadow-lg text-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <span className="font-bold text-[16px]">Proceder a Cobrar</span>
            <span className="font-bold text-[16px]">
              RD$
              {amount?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
