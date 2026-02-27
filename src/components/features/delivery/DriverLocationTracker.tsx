"use client";

import { useDriverLocation } from "@/src/lib/hooks/useDriverLocation";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function DriverLocationTracker() {
  const { isTracking, error, location, permissionStatus, requestPermission } =
    useDriverLocation({
      enabled: true,
    });
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const needsLocationPermission =
    permissionStatus === "prompt" || permissionStatus === "denied";
  const geolocationUnsupported = permissionStatus === "unsupported";

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    const granted = await requestPermission();
    setIsRequestingPermission(false);

    if (granted) {
      toast.success("Ubicación activada correctamente.");
      return;
    }

    if (permissionStatus === "denied") {
      toast.error(
        "Permiso bloqueado. Debes habilitar la ubicación desde la configuración del navegador/dispositivo.",
      );
      return;
    }

    toast.error(error || "No se pudo activar la ubicación.");
  };

  return (
    <>
      {(needsLocationPermission || geolocationUnsupported) && (
        <div className="fixed inset-x-3 top-3 z-[999] rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm md:left-[220px] md:right-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
            <div className="space-y-1">
              <p className="text-sm text-amber-900">
                {geolocationUnsupported
                  ? "Este dispositivo o navegador no soporta geolocalización."
                  : "Activa los permisos de ubicación para seguir recibiendo pedidos y compartir tu ubicación en tiempo real."}
              </p>
              {error && !geolocationUnsupported && (
                <p className="text-xs text-amber-800">{error}</p>
              )}
            </div>
            {!geolocationUnsupported && (
              <Button
                type="button"
                size="sm"
                className="h-8"
                disabled={isRequestingPermission}
                onClick={() => {
                  void handleRequestPermission();
                }}
              >
                {isRequestingPermission
                  ? "Solicitando..."
                  : "Activar ubicación"}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-2 right-2 z-[999] rounded-full bg-black/50 px-2 py-1 text-xs text-white pointer-events-none">
        GPS: {isTracking ? "Activo" : "Inactivo"}
        {location &&
          ` (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`}
      </div>
    </>
  );
}
