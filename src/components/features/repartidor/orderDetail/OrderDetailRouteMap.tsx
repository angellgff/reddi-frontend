"use client";

import RouteMap from "@/src/components/features/finalUser/checkout/RouteMap";

type Coords = [number, number]; // [lng, lat]

interface Props {
  origin: Coords | null;
  destination: Coords | null;
  driverLocation: Coords | null;
}

export default function OrderDetailRouteMap({
  origin,
  destination,
  driverLocation,
}: Props) {
  // If we don't have enough points, show placeholder or loading
  if (!origin || !destination) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
        Mapa no disponible
      </div>
    );
  }

  // Convert [lng, lat] -> { longitude, latitude } for RouteMap
  const originObj = { longitude: origin[0], latitude: origin[1] };
  const destObj = { longitude: destination[0], latitude: destination[1] };

  // TODO: Handle driverLocation marker if RouteMap supports it, 
  // or extend RouteMap later. For now we just show A -> B.

  return (
    <div className="w-full h-full">
      <RouteMap
        origin={originObj}
        destination={destObj}
        height={250} // Fixed height to match parent container constraint
        // routeGeoJson not explicitly available here unless passed prop or calculated
      />
    </div>
  );
}
