"use client";

import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";
import { cn } from "@/src/lib/utils";
import { ShoppingCart, Tag, Loader2 } from "lucide-react";
import SearchIcon from "@/src/components/icons/SearchIcon";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { toggleCart } from "@/src/lib/store/uiSlice";
import { selectCartCount } from "@/src/lib/store/cartSlice";
import Badge from "@/src/components/basics/header/Badge";

export default function FloatingBottomBar() {
  const { mode, text, secondaryText, action } = useFloatingButtonStore();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);

  if (mode === "hidden") return null;

  return (
    <footer className="fixed bottom-6 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none md:hidden transition-all duration-300">
      <div className="w-full max-w-md mx-auto pointer-events-auto">
        {/* === SEARCH MODE === */}
        {mode === "search" && (
          <div className="flex items-center gap-3 w-full justify-between">
            <div className="relative flex-grow h-[47px]">
              <form
                action="/user/search"
                method="get"
                className="pointer-events-auto w-full h-full"
              >
                <div className="relative w-full h-full">
                  <div className="pointer-events-none absolute left-[13px] top-[9px] w-[29px] h-[29px] bg-white rounded-full flex items-center justify-center z-10">
                    <SearchIcon className="w-[18px] h-[18px]" fill="#04BD88" />
                  </div>
                  <input
                    name="q"
                    type="search"
                    defaultValue={searchParams?.get("q") || ""}
                    placeholder="&#8216;SBG&#8217;"
                    className="w-full h-full rounded-[25px] border-none bg-[#04BD88] pl-[56px] pr-4 text-white placeholder:text-white/90 placeholder:font-semibold text-center font-semibold text-[14px] shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </form>
            </div>
            <button
              className="flex h-[47px] w-[55px] flex-shrink-0 items-center justify-center rounded-[25px] bg-[#04BD88] shadow-lg active:scale-95 transition-transform"
              aria-label="Abrir carrito"
              onClick={() => dispatch(toggleCart())}
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartCount > 0 && ( // Conditional badge
                  <div className="absolute -top-2 -right-2">
                    <Badge
                      count={cartCount}
                      color="bg-white"
                      className="text-[#04BD88] text-[10px] w-4 h-4 flex items-center justify-center rounded-full p-0 font-bold"
                    />
                  </div>
                )}
              </div>
            </button>
          </div>
        )}

        {/* === STORE MODE === */}
        {mode === "store" && (
          <div className="flex items-center gap-3 w-full justify-between">
            {/* Store Name Button */}
            <button
              onClick={action}
              className="flex-1 bg-[#04BD88] h-[47px] rounded-[25px] px-4 shadow-lg text-white font-bold text-sm flex items-center justify-center truncate active:scale-95 transition-transform"
            >
              {text}
            </button>
            {/* Discount Button */}
            {secondaryText && (
              <div className="bg-[#04BD88] h-[47px] rounded-[25px] px-4 shadow-lg text-white font-bold text-sm flex items-center justify-center truncate max-w-[50%]">
                {secondaryText}
              </div>
            )}
          </div>
        )}

        {/* === PRODUCT MODE (Add) === */}
        {mode === "product" && (
          <div className="flex items-center justify-between gap-3 w-full">
            {/* Add Button */}
            <button
              onClick={action}
              className="flex-grow bg-[#04BD88] h-[47px] rounded-[25px] shadow-lg text-white font-bold text-sm px-6 flex items-center justify-center active:scale-95 transition-transform"
            >
              {text} {/* "Añade un Producto" */}
            </button>

            {/* Tag Button (Optional functionality, maybe offers?) */}
            <button className="w-[47px] h-[47px] bg-[#04BD88] rounded-full shadow-lg flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
              <Tag className="w-5 h-5 text-white fill-white" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="w-[47px] h-[47px] bg-[#04BD88] rounded-full shadow-lg flex items-center justify-center flex-shrink-0 relative active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <div className="absolute -top-2 -right-2">
                  <Badge
                    count={cartCount}
                    color="bg-white"
                    className="text-[#04BD88] text-[10px] w-4 h-4 flex items-center justify-center rounded-full p-0 font-bold"
                  />
                </div>
              )}
            </button>
          </div>
        )}

        {/* === CART MODE (or simple full button) === */}
        {mode === "cart" && (
          <button
            onClick={action || (() => dispatch(toggleCart()))}
            className="w-full bg-[#04BD88] h-[47px] rounded-[25px] shadow-lg text-white font-bold text-sm flex items-center justify-between px-6 active:scale-95 transition-transform"
          >
            <span>{text}</span> {/* "Ver Carrito" */}
            <ShoppingCart className="w-5 h-5 text-white" />
          </button>
        )}

        {/* === LOADING MODE === */}
        {mode === "loading" && (
          <div className="w-full bg-[#04BD88] h-[47px] rounded-[25px] shadow-lg text-white font-bold text-sm flex items-center justify-between px-6">
            <span>{text}</span> {/* "Agregando..." */}
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
      </div>
    </footer>
  );
}
