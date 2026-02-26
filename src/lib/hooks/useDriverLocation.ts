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

export function useDriverLocation({ enabled = true }: UseDriverLocationProps) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const lastUpdateRef = useRef<number>(0);
  const lastLocationRef = useRef<LocationData | null>(null);
  const watchIdRef = useRef<number | null>(null);

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
    console.error("Error getting location:", {
      code: error.code,
      message: error.message,
    });
    setError(error.message);
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

  return { location, error, isTracking };
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
