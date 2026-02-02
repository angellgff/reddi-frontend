"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

export default function StoreLayout({
  children,
  categoriesSlider,
}: {
  children: ReactNode;
  categoriesSlider: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isSliderOpen = pathname?.includes("/categories");

  return (
    <div className="relative">
      {/* Main Store Content */}
      {children}

      {/* Slider Overlay */}
      <AnimatePresence>
        {isSliderOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => router.back()}
            />
            {/* Slider Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-xl overflow-y-auto"
            >
              {categoriesSlider}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
