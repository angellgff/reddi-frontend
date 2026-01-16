"use client";

import { useDriverLocation } from "@/src/lib/hooks/useDriverLocation";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";

export default function DriverLocationTracker() {
  const [userId, setUserId] = useState<string | null>(null);

  // We need to fetch the current user ID to pass to the hook
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  const { isTracking, error, location } = useDriverLocation({
    userId: userId || "",
    enabled: !!userId,
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
