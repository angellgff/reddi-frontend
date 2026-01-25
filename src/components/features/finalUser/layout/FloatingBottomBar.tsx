"use client";

import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";
import { cn } from "@/src/lib/utils";
import { Tag, Loader2 } from "lucide-react";
import SearchIcon from "@/src/components/icons/SearchIcon";
import Image from "next/image";
import { useSearchParams, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { toggleCart } from "@/src/lib/store/uiSlice";
import { selectCartCount } from "@/src/lib/store/cartSlice";
import Badge from "@/src/components/basics/header/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function FloatingBottomBar() {
  const {
    mode,
    text,
    secondaryText,
    action,
    quantity,
    onIncrement,
    onDecrement,
    disabled,
  } = useFloatingButtonStore();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (
    pathname === "/user/profile" ||
    pathname === "/user/orders" ||
    pathname?.startsWith("/user/orders/")
  )
    return null;

  if (mode === "hidden") return null;

  return (
    <footer className="fixed bottom-6 left-0 right-0 z-[100] px-6 flex justify-center pointer-events-none md:hidden gap-3">
      <motion.div
        layoutRoot
        className="w-full max-w-md mx-auto pointer-events-auto min-h-[47px] relative flex items-center justify-between gap-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {mode === "product-details" && (
            <motion.div
              layout
              key="qty-selector"
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="flex items-center justify-between bg-white shadow-[0_2px_15px_rgba(0,0,0,0.08)] rounded-full px-4 py-2 h-[47px] w-[130px] flex-shrink-0 z-10"
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDecrement?.();
                }}
                className="text-[#04BD88] text-xl font-medium w-8 flex justify-center active:scale-90 transition-transform"
              >
                -
              </button>
              <span className="text-black font-semibold text-sm">
                {quantity || 1}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onIncrement?.();
                }}
                className="text-[#04BD88] text-xl font-medium w-8 flex justify-center active:scale-90 transition-transform"
              >
                +
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === MAIN PILL (Search / Store Name / Add / Loading / Full Cart) === */}
        {/* Moved outside AnimatePresence to ensure it never unmounts/remounts during sibling transitions */}
        <motion.div
          layout
          className={cn(
            "h-[47px] rounded-[25px] flex-grow shadow-lg active:scale-[0.98] overflow-hidden relative z-20 bg-[#04BD88]",
          )}
          initial={false}
          animate={{
            flexGrow: 1,
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        >
          {/* -- CONTENT OF MAIN PILL -- */}
          {/* Use absolute positioning or grid overlap to prevent stacking (vertical slide) during transition */}
          <div className="relative w-full h-full">
            <AnimatePresence initial={false}>
              {mode === "search" && (
                <motion.div
                  key="content-search"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <form
                    action="/user/search"
                    method="get"
                    className="pointer-events-auto w-full h-full"
                  >
                    <div className="relative w-full h-full">
                      <div className="pointer-events-none absolute left-[13px] top-[9px] w-[29px] h-[29px] bg-white rounded-full flex items-center justify-center z-10">
                        <SearchIcon
                          className="w-[18px] h-[18px]"
                          fill="#04BD88"
                        />
                      </div>
                      <input
                        name="q"
                        type="search"
                        defaultValue={searchParams?.get("q") || ""}
                        placeholder="&#8216;SBG&#8217;"
                        className="w-full h-full rounded-[25px] border-none bg-transparent pl-[56px] pr-4 text-white placeholder:text-white/90 placeholder:font-semibold text-center font-semibold text-[14px] focus:outline-none focus:bg-[#05a87a]/20 transition-colors"
                      />
                    </div>
                  </form>
                </motion.div>
              )}

              {mode === "store" && (
                <motion.button
                  key="content-store"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (action) {
                      action();
                    } else {
                      dispatch(toggleCart());
                    }
                  }}
                  className="absolute inset-0 w-full h-full flex items-center justify-between px-[13px] text-white cursor-pointer pointer-events-auto"
                >
                  {/* Left: Cart Icon */}
                  <div className="flex-none w-[20px] flex items-center justify-center">
                    <Image
                      src="/new-design/nd-cart-fill.png"
                      width={20}
                      height={20}
                      alt="Carrito"
                    />
                  </div>

                  {/* Center: Ver Carrito + Store Name */}
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="font-bold text-[10px] leading-tight tracking-[-0.01em]">
                      Ver Carrito
                    </span>
                    <span className="font-bold text-[16px] leading-tight tracking-[-0.01em]">
                      {text}
                    </span>
                  </div>

                  {/* Right: Badge */}
                  <div className="flex-none w-[20px] flex items-center justify-center">
                    <div className="w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center">
                      <span className="text-[#04BD88] text-[12px] font-bold">
                        {mounted ? cartCount : 0}
                      </span>
                    </div>
                  </div>
                </motion.button>
              )}

              {mode === "product" && (
                <motion.button
                  key="content-product"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={action}
                  className="absolute inset-0 w-full h-full flex items-center justify-center px-6 text-white font-bold text-sm"
                >
                  {text}
                </motion.button>
              )}

              {mode === "checkout" && (
                <motion.button
                  key="content-checkout"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={!disabled ? action : undefined}
                  disabled={disabled}
                  className={cn(
                    "absolute inset-0 w-full h-full flex items-center justify-between px-6 text-white font-bold text-[16px] transition-opacity",
                    disabled ? "opacity-50 cursor-not-allowed" : "",
                  )}
                >
                  <span>{text}</span>
                  {secondaryText && <span>{secondaryText}</span>}
                </motion.button>
              )}

              {mode === "product-details" && (
                <motion.button
                  key="content-product-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={!disabled ? action : undefined}
                  disabled={disabled}
                  className={cn(
                    "absolute inset-0 w-full h-full flex items-center justify-between px-6 text-white font-bold text-sm transition-opacity",
                    disabled ? "opacity-50 cursor-not-allowed" : "",
                  )}
                >
                  <span>{text}</span>
                  {secondaryText && (
                    <span className="font-normal opacity-90">
                      {secondaryText}
                    </span>
                  )}
                </motion.button>
              )}

              {(mode === "cart" || mode === "loading") && (
                <motion.button
                  key="content-cart-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={
                    mode === "cart"
                      ? action || (() => dispatch(toggleCart()))
                      : undefined
                  }
                  className="absolute inset-0 w-full h-full flex items-center justify-between px-6 text-white font-bold text-sm"
                >
                  <span>{text}</span>
                  {mode === "loading" ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Image
                      src="/new-design/nd-cart-fill.png"
                      width={20}
                      height={20}
                      alt="Carrito"
                    />
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false}>
          {/* === SECONDARY PILLS (Right/Middle slots) === */}

          {/* Tag Pill (Product Mode) */}
          {mode === "product" && (
            <motion.button
              key="tag-pill"
              layoutId="tag-pill"
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "47px" }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="w-[47px] h-[47px] bg-[#04BD88] rounded-full shadow-lg flex items-center justify-center flex-shrink-0 active:scale-95 z-10"
            >
              <Tag className="w-5 h-5 text-white fill-white" />
            </motion.button>
          )}

          {/* Discount Pill (Store Mode) */}
          {mode === "store" && secondaryText && (
            <motion.div
              key="discount-pill"
              layoutId="discount-pill"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="h-[47px] bg-[#04BD88] rounded-[25px] px-4 shadow-lg text-white font-bold text-sm flex items-center justify-center truncate max-w-[50%] flex-shrink-0 z-10"
            >
              {secondaryText}
            </motion.div>
          )}

          {/* Cart Button (Search & Product modes) */}
          {(mode === "search" || mode === "product") && (
            <motion.button
              key="cart-btn"
              layoutId="cart-pill"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              onClick={() => dispatch(toggleCart())}
              className="w-[55px] h-[47px] bg-[#04BD88] rounded-full shadow-lg flex items-center justify-center flex-shrink-0 relative active:scale-95 z-10"
            >
              <Image
                src="/new-design/nd-cart-fill.png"
                width={20}
                height={20}
                alt="Carrito"
              />
              {mounted && cartCount > 0 && (
                <div className="absolute -top-2 -right-2">
                  <Badge
                    count={cartCount}
                    color="bg-white"
                    className="text-[#04BD88] text-[10px] w-4 h-4 flex items-center justify-center rounded-full p-0 font-bold"
                  />
                </div>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </footer>
  );
}
