"use client";

import { useDriverLocation } from "@/src/lib/hooks/useDriverLocation";

export default function DriverLocationTracker() {
  const { isTracking, error, location } = useDriverLocation({
    enabled: true,
  });

  if (error) {
    // Optionally log error or show a toast
    console.warn("Driver tracking error:", error);
    return null;
  }

  // Render nothing, or a small indicator
  return (
    <div className="fixed bottom-2 right-2 text-xs bg-black/50 text-white px-2 py-1 rounded-full z-50 pointer-events-none">
      GPS: {isTracking ? "Activo" : "Inactivo"}
      {location &&
        ` (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`}
    </div>
  );
}
