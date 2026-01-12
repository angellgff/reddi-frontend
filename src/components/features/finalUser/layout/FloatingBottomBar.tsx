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
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingBottomBar() {
  const { mode, text, secondaryText, action } = useFloatingButtonStore();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);

  if (mode === "hidden") return null;

  return (
    <footer className="fixed bottom-6 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none md:hidden gap-3">
      <div className="w-full max-w-md mx-auto pointer-events-auto min-h-[47px] relative flex items-center justify-between gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {/* === MAIN PILL (Search / Store Name / Add / Loading / Full Cart) === */}
          <motion.div
            layoutId="main-pill"
            layout
            className={cn(
              "h-[47px] rounded-[25px] flex-grow shadow-lg active:scale-[0.98] overflow-hidden relative z-20 bg-[#04BD88]"
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
              <AnimatePresence>
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={action}
                    className="absolute inset-0 w-full h-full flex items-center justify-center px-4 text-white font-bold text-sm truncate"
                  >
                    {text}
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
                      <ShoppingCart className="w-5 h-5 text-white" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

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
              className="w-[47px] h-[47px] bg-[#04BD88] rounded-full shadow-lg flex items-center justify-center flex-shrink-0 relative active:scale-95 z-10"
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
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </footer>
  );
}
