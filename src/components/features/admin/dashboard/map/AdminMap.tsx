"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type { AdminMapData } from "@/src/lib/admin/data/dashboard/getMapData";
import { GOOGLE_MAP_ID } from "@/src/lib/constants";

interface MapShipment {
  routeGeoJson?: { coordinates: number[][]; type: "LineString" };
  origin?: { longitude: number; latitude: number };
  destination?: { longitude: number; latitude: number };
}

export default function AdminMap({
  data,
  height = 320,
}: {
  data: AdminMapData;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("[AdminMap] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing");
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!apiKey) return;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["maps", "marker", "places", "routes"],
    });

    loader.load().then(async () => {
      const { Map } = (await google.maps.importLibrary(
        "maps",
      )) as google.maps.MapsLibrary;

      const map = new Map(containerRef.current!, {
        center: { lat: 18.4861, lng: -69.9312 }, // Santo Domingo
        zoom: 3,
        mapId: GOOGLE_MAP_ID,
        mapTypeControl: false,
        streetViewControl: false,
      });

      mapRef.current = map;

      if (data) {
        updateMap(map, data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    if (mapRef.current && data) {
      updateMap(mapRef.current, data);
    }
  }, [data]);

  const updateMap = (map: google.maps.Map, data: AdminMapData) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    data.drivers?.forEach((d) => {
      if (typeof d.lat === "number" && typeof d.lng === "number") {
        const pos = { lat: d.lat, lng: d.lng };
        const marker = new google.maps.Marker({
          position: pos,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#0ea5e9",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "white",
          },
          title: "Driver",
        });
        markersRef.current.push(marker);
        bounds.extend(pos);
        hasPoints = true;
      }
    });

    data.partners?.forEach((p) => {
      if (typeof p.lat === "number" && typeof p.lng === "number") {
        const pos = { lat: p.lat, lng: p.lng };
        const marker = new google.maps.Marker({
          position: pos,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#7c3aed",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "white",
          },
          title: p.name,
        });
        markersRef.current.push(marker);
        bounds.extend(pos);
        hasPoints = true;
      }
    });

    data.shipments?.forEach((s) => {
      const ship = s as MapShipment;
      if (ship.origin) {
        bounds.extend({
          lat: ship.origin.latitude,
          lng: ship.origin.longitude,
        });
        hasPoints = true;
      }
      if (ship.destination) {
        bounds.extend({
          lat: ship.destination.latitude,
          lng: ship.destination.longitude,
        });
        hasPoints = true;
      }
      if (ship.routeGeoJson?.coordinates) {
        const path = ship.routeGeoJson.coordinates.map((coord) => ({
          lat: coord[1],
          lng: coord[0],
        }));
        const polyline = new google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: "#10b981",
          strokeOpacity: 0.7,
          strokeWeight: 4,
          map: map,
        });
        polylinesRef.current.push(polyline);
      }
    });

    if (hasPoints) {
      map.fitBounds(bounds);
    }
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
