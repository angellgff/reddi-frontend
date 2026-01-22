"use client";

import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";
import { cn } from "@/src/lib/utils";
import Image from "next/image";

export default function DynamicFloatingButton() {
  const { mode, text, action } = useFloatingButtonStore();

  if (mode === "hidden") return null;

  const icon = null; // Placeholder as icon is not in store yet

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none">
      <div className="flex items-center gap-3 w-full justify-between pointer-events-auto max-w-md mx-auto">
        <button
          onClick={action}
          className={cn(
            "flex-1 flex items-center bg-[#04BD88] h-[47px] rounded-[25px] px-4 shadow-lg text-white font-semibold transform transition-all active:scale-95",
            "justify-start gap-4",
          )}
        >
          <div className="bg-white rounded-full w-[29px] h-[29px] flex items-center justify-center">
            {icon || <div className="w-3 h-3 rounded-sm bg-[#04BD88]" />}
          </div>
          <span className="text-sm font-semibold truncate">{text}</span>
        </button>
        <button className="bg-[#04BD88] w-[55px] h-[47px] rounded-[25px] flex items-center justify-center shadow-lg transform transition-all active:scale-95">
          <Image src="/nd-cart-fill.png" width={20} height={20} alt="Carrito" />
        </button>
      </div>
    </div>
  );
}
