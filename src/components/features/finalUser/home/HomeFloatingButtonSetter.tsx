"use client";

import { useEffect } from "react";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

export default function HomeFloatingButtonSetter() {
  const showButton = useFloatingButtonStore((state) => state.showButton);

  useEffect(() => {
    // Set the specific button for the home page
    showButton("SBG", undefined, () => console.log("SBG clicked"));

    // In a real app we might want to clean up or reset when leaving,
    // but the next page will likely set its own button or we rely on layout to handle route changes.
    // Ideally we return a cleanup function, but only if we want no button on other pages by default.
  }, [showButton]);

  return null;
}
