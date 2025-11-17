"use client";

import { useEffect, useState } from "react";
import RouteMap from "@/src/components/features/finalUser/checkout/RouteMap";

type LngLat = { longitude: number; latitude: number };

export default function OrderDetailRouteMap({
  partnerId,
  userAddressId,
  eta,
}: {
  partnerId?: string | null;
  userAddressId?: string | null;
  eta: string;
}) {
  const [origin, setOrigin] = useState<LngLat | null>(null);
  const [destination, setDestination] = useState<LngLat | null>(null);
  const [routeGeoJson, setRouteGeoJson] = useState<{
    type: "LineString";
    coordinates: [number, number][];
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!partnerId || !userAddressId) return;
      try {
        const resp = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerId, userAddressId }),
        });
        if (!mounted) return;
        if (resp.ok) {
          const json = await resp.json();
          setOrigin(json.originCoordinates || null);
          setDestination(json.destinationCoordinates || null);
          setRouteGeoJson(json.routeGeoJson || null);
        }
      } catch {
        /* noop */
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [partnerId, userAddressId]);

  if (!origin || !destination) {
    return (
      <div className="relative w-full h-[201px] rounded-xl overflow-hidden mt-2 bg-[url('/placeholder-map.png')] bg-cover bg-center">
        <div className="absolute left-5 top-5 bg-white px-2 py-1 rounded-lg shadow text-[12px] font-bold">
          {eta}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-2">
      <RouteMap
        origin={origin}
        destination={destination}
        routeGeoJson={routeGeoJson ?? undefined}
        height={201}
      />
      <div className="absolute left-5 top-5 bg-white px-2 py-1 rounded-lg shadow text-[12px] font-bold">
        {eta}
      </div>
    </div>
  );
}
