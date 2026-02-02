"use client";

import React, { useEffect, useState } from "react";
import { Share, PlusSquare, Download, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PWAInstallButton() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect Standalone
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    console.log("[PWA Debug] Env check:", {
      userAgent,
      isIosDevice,
      isInStandaloneMode,
    });

    // Initial check for deferred prompt (browsers sometimes fire it before load)
    // Note: The event listener handles usually, but this is React state.

    const handleBeforeInstallPrompt = (e: any) => {
      console.log("[PWA Debug] Evento beforeinstallprompt capturado", e);
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      // We've used the prompt, and can't use it again, discard it
      setDeferredPrompt(null);
    }
  };

  // Logic:
  // 1. If already installed (standalone), show nothing.
  // 2. If iOS, show button (which opens instructions).
  // 3. If Android/Desktop, show button ONLY if we captured the install prompt.

  console.log("[PWA Debug] Render State:", {
    isStandalone,
    isIOS,
    hasDeferredPrompt: !!deferredPrompt,
  });

  if (isStandalone) return null;

  // Only show on login page
  const isLoginPage = pathname === "/auth/login" || pathname === "/login";
  if (!isLoginPage) return null;

  const shouldShowButton = isIOS || !!deferredPrompt;

  if (!shouldShowButton) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleInstallClick}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-white shadow-xl transition-all hover:scale-105 active:scale-95 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
        aria-label="Instalar Aplicación"
      >
        <Download className="h-5 w-5" />
        <span className="font-semibold text-sm">Descargar App</span>
      </button>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative p-6">
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 text-center">
                  Instalar Aplicación
                </h3>
                <p className="text-center text-sm text-gray-500 mt-1">
                  Sigue estos pasos en tu dispositivo iOS
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <Share className="h-6 w-6 text-blue-600 shrink-0" />
                  <div className="text-sm text-gray-700">
                    1. Pulsa el botón{" "}
                    <span className="font-bold text-gray-900">Compartir</span>{" "}
                    en la barra de navegación.
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <PlusSquare className="h-6 w-6 text-gray-700 shrink-0" />
                  <div className="text-sm text-gray-700">
                    2. Desliza y selecciona{" "}
                    <span className="font-bold text-gray-900">
                      "Añadir a inicio"
                    </span>
                    .
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
