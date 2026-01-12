"use client";

import { useEffect } from "react";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

export default function HomeFloatingButtonSetter() {
  const showSearch = useFloatingButtonStore((state) => state.showSearch);

  useEffect(() => {
    // Set search mode for home page
    showSearch();
  }, [showSearch]);

  return null;
}
