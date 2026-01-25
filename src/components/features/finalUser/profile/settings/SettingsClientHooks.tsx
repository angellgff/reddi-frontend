"use client";

import { useEffect } from "react";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

export default function SettingsClientHooks() {
  const { hideButton, showSearch } = useFloatingButtonStore();

  useEffect(() => {
    hideButton();
    return () => {
      showSearch();
    };
  }, [hideButton, showSearch]);

  return null;
}
