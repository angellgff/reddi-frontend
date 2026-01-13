"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

type LngLat = { longitude: number; latitude: number };

export default function RouteMap({
  origin,
  destination,
  routeGeoJson,
  height = 260,
}: {
  origin: LngLat;
  destination: LngLat;
  routeGeoJson?: { type: "LineString"; coordinates: [number, number][] } | null;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const routePolylineRef = useRef<google.maps.Polyline | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!apiKey) return;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["maps", "marker"],
    });

    loader.load().then(async () => {
      const { Map } = (await google.maps.importLibrary(
        "maps"
      )) as google.maps.MapsLibrary;

      // Initial center can be anywhere, we fitBounds later
      const map = new Map(containerRef.current!, {
        center: { lat: origin.latitude, lng: origin.longitude },
        zoom: 13,
        mapId: "ROUTE_MAP_ID",
        mapTypeControl: false,
        streetViewControl: false,
      });

      mapRef.current = map;

      updateMap(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]); // Init only

  useEffect(() => {
    if (mapRef.current) {
      updateMap(mapRef.current);
    }
  }, [origin, destination, routeGeoJson]);

  const updateMap = (map: google.maps.Map) => {
    // 1. Clear previous
    originMarkerRef.current?.setMap(null);
    destinationMarkerRef.current?.setMap(null);
    routePolylineRef.current?.setMap(null);

    const bounds = new google.maps.LatLngBounds();

    // 2. Set new markers
    // Origin: Green (#04BD88)
    originMarkerRef.current = new google.maps.Marker({
      position: { lat: origin.latitude, lng: origin.longitude },
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#04BD88",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "white",
      },
      title: "Origin", // Origen
    });
    bounds.extend({ lat: origin.latitude, lng: origin.longitude });

    // Destination: Dark (#1f2937)
    destinationMarkerRef.current = new google.maps.Marker({
      position: { lat: destination.latitude, lng: destination.longitude },
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#1f2937",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "white",
      },
      title: "Destination", // Destino
    });
    bounds.extend({ lat: destination.latitude, lng: destination.longitude });

    // 3. Draw Route
    if (routeGeoJson && routeGeoJson.coordinates) {
      const path = routeGeoJson.coordinates.map((c) => ({
        lat: c[1],
        lng: c[0],
      }));
      routePolylineRef.current = new google.maps.Polyline({
        path: path,
        map: map,
        strokeColor: "#04BD88",
        strokeOpacity: 1.0,
        strokeWeight: 5,
      });

      path.forEach((p) => bounds.extend(p));
    }

    // 4. Fit bounds
    // Add some padding by creating simpler logic if needed, but fitBounds works
    map.fitBounds(bounds, 50); // 50px padding
  };

  if (!apiKey) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[#D9DCE3] text-sm text-gray-500"
        style={{ height }}
      >
        Mapa no disponible (falta API Key)
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-[#D9DCE3]"
      style={{ height }}
    />
  );
}
