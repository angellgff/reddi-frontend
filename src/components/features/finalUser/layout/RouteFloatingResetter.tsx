"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

export default function RouteFloatingResetter() {
  const pathname = usePathname();
  const showSearch = useFloatingButtonStore((state) => state.showSearch);

  useEffect(() => {
    // Definir patrones de rutas que gestionan su propio estado del botón
    // Si la ruta coincide, NO reseteamos a search, dejamos que la página se encargue.
    // Esto evita el "flicker" o recarga visual del botón al navegar entre Store y Product.
    const isStorePage = /^\/user\/stores\/[^\/]+$/.test(pathname);
    const isProductPage = /^\/user\/stores\/[^\/]+\/product\/[^\/]+$/.test(
      pathname
    );

    // Si NO estamos en una página que controla el botón explícitamente, volvemos al default (Search).
    // Por ejemplo: Home, Orders, Profile, etc.
    if (!isStorePage && !isProductPage) {
      showSearch();
    }
  }, [pathname, showSearch]);

  return null;
}
