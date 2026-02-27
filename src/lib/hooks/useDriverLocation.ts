import { useEffect, useState, useRef } from "react";
import * as Sentry from "@sentry/nextjs";
import { updateDriverLocationAction } from "@/src/lib/actions/delivery";

type LocationData = {
  latitude: number;
  longitude: number;
};

interface UseDriverLocationProps {
  enabled?: boolean;
}

type GeolocationPermissionStatus =
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported"
  | "unknown";

export function useDriverLocation({ enabled = true }: UseDriverLocationProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<GeolocationPermissionStatus>("unknown");

  const lastUpdateRef = useRef<number>(0);
  const lastLocationRef = useRef<LocationData | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const permissionRef = useRef<PermissionStatus | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncPermission = async () => {
      if (!("geolocation" in navigator)) {
        if (isMounted) {
          setPermissionStatus("unsupported");
        }
        return;
      }

      if (!("permissions" in navigator)) {
        if (isMounted) {
          setPermissionStatus("unknown");
        }
        return;
      }

      try {
        const status = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });

        if (!isMounted) return;

        permissionRef.current = status;
        setPermissionStatus(status.state as GeolocationPermissionStatus);

        status.onchange = () => {
          setPermissionStatus(status.state as GeolocationPermissionStatus);
          if (status.state === "granted") {
            setError(null);
          }
        };
      } catch {
        if (isMounted) {
          setPermissionStatus("unknown");
        }
      }
    };

    syncPermission();

    return () => {
      isMounted = false;
      if (permissionRef.current) {
        permissionRef.current.onchange = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopTracking();
      return;
    }

    startTracking();

    return () => {
      stopTracking();
    };
  }, [enabled]);

  const startTracking = () => {
    if (!("geolocation" in navigator)) {
      setPermissionStatus("unsupported");
      setError("Geolocalización no soportada por este navegador.");
      return;
    }

    setIsTracking(true);

    // Options for high accuracy
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      options,
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const handlePositionUpdate = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    const newLocation = { latitude, longitude };

    // console.log("📍 [useDriverLocation] Raw GPS:", newLocation);
    setLocation(newLocation);
    setPermissionStatus("granted");
    setError(null);

    // Throttling logic
    const now = Date.now();
    const timeDiff = now - lastUpdateRef.current;

    // Check distance if we have a previous location
    let distance = 0;
    if (lastLocationRef.current) {
      distance = calculateDistance(
        lastLocationRef.current.latitude,
        lastLocationRef.current.longitude,
        latitude,
        longitude,
      );
    }

    // console.log(`📏 [useDriverLocation] Dist: ${distance.toFixed(1)}m, Time: ${timeDiff}ms`);

    // Update if > 10 seconds OR > 20 meters moved
    // Using 10000ms = 10s
    if (timeDiff > 10000 || distance > 20) {
      console.log("🚀 [useDriverLocation] Triggering DB Update...", {
        latitude,
        longitude,
      });
      updateLocationInDB(latitude, longitude);
      lastUpdateRef.current = now;
      lastLocationRef.current = newLocation;
    }
  };

  const handlePositionError = (error: GeolocationPositionError) => {
    const code = error?.code ?? 0;
    const rawMessage =
      error?.message?.trim() || "No se pudo obtener la ubicación.";

    const userMessageByCode: Record<number, string> = {
      1: "Permiso de ubicación denegado. Activa la ubicación para continuar.",
      2: "Ubicación no disponible en este momento.",
      3: "Tiempo de espera agotado al obtener la ubicación.",
    };

    const userMessage = userMessageByCode[code] || rawMessage;

    if (code === 1) {
      setPermissionStatus("denied");
    }

    console.warn("[useDriverLocation] Geolocation warning", {
      code,
      message: rawMessage,
    });

    setError(userMessage);
  };

  const updateLocationInDB = async (lat: number, lng: number) => {
    try {
      const result = await updateDriverLocationAction(lat, lng);
      if (!result.success) {
        console.error("Server location update error:", result.error);
      } else {
        console.log("✅ [useDriverLocation] DB Updated Successfully");
      }
    } catch (err) {
      Sentry.captureException(err);
      console.error("Failed to update location:", err);
    }
  };

  const requestPermission = () => {
    if (!("geolocation" in navigator)) {
      setPermissionStatus("unsupported");
      setError("Geolocalización no soportada por este navegador.");
      return Promise.resolve(false);
    }

    setError(null);

    return new Promise<boolean>((resolve) => {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            handlePositionUpdate(position);
            if (!isTracking) {
              startTracking();
            }
            resolve(true);
          },
          (geoError) => {
            handlePositionError(geoError);
            resolve(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      } catch {
        setError(
          "No fue posible solicitar ubicación. Verifica que uses HTTPS o localhost.",
        );
        resolve(false);
      }
    });
  };

  return { location, error, isTracking, permissionStatus, requestPermission };
}

// Helper: Haversine distance in meters
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}
