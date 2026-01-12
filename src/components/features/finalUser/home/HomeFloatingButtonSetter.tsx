"use client";

import { useEffect } from "react";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

export default function HomeFloatingButtonSetter() {
  const showSearch = useFloatingButtonStore((state) => state.showSearch);

  useEffect(() => {
    // Set search mode for home page
    showSearch();
    // Limpieza opcional pero buena práctica
    return () => showSearch();
  }, [showSearch]);

  return null;
}
