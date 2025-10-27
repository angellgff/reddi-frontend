"use client";

import React, { useEffect, useMemo, useRef } from "react";
import mapboxgl, {
  Map as MapboxMap,
  LngLatLike,
  GeoJSONSource,
} from "mapbox-gl";

export type LatLng = [number, number]; // [lat, lng]

export type OrderMapProps = {
  center?: LatLng; // lat, lng
  zoom?: number;
  className?: string;
  origin?: LatLng; // ruta origen (lat, lng)
  destination?: LatLng; // ruta destino (lat, lng)
};

export default function OrderMap({
  center = [18.473, -69.89],
  zoom = 14,
  className = "h-64 md:h-96 w-full rounded-2xl overflow-hidden",
  origin,
  destination,
}: OrderMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const hasRoute = !!origin && !!destination;

  // Convertir [lat, lng] -> [lng, lat]
  const toLngLat = (latlng: LatLng): [number, number] => [latlng[1], latlng[0]];

  const initialCenter = useMemo<LngLatLike>(() => {
    return toLngLat(center);
  }, [center]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // evitar doble init
    if (!token) {
      // Renderiza contenedor vacío si no hay token
      return;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom,
    });
    mapRef.current = map;

    map.on("load", async () => {
      // Marcadores si hay ruta
      if (hasRoute && origin && destination) {
        new mapboxgl.Marker({ color: "#04BD88" })
          .setLngLat(toLngLat(origin))
          .addTo(map);
        new mapboxgl.Marker({ color: "#222" })
          .setLngLat(toLngLat(destination))
          .addTo(map);

        try {
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${toLngLat(
            origin
          ).join(",")};${toLngLat(destination).join(
            ","
          )}?geometries=geojson&overview=full&access_token=${token}`;
          const res = await fetch(url);
          const json = await res.json();
          const route = json?.routes?.[0]?.geometry;
          if (route) {
            const sourceId = "route";
            if (!map.getSource(sourceId)) {
              map.addSource(sourceId, {
                type: "geojson",
                data: {
                  type: "Feature",
                  properties: {},
                  geometry: route,
                },
              });
              map.addLayer({
                id: "route-line",
                type: "line",
                source: sourceId,
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#04BD88", "line-width": 5 },
              });
            } else {
              const src = map.getSource(sourceId) as GeoJSONSource;
              src.setData({
                type: "Feature",
                properties: {},
                geometry: route,
              } as any);
            }
            // Ajustar bounds a la ruta
            const coords = route.coordinates as [number, number][];
            const bounds = coords.reduce(
              (b, c) => b.extend(c as any),
              new mapboxgl.LngLatBounds(coords[0], coords[0])
            );
            map.fitBounds(bounds, { padding: 40 });
          }
        } catch (e) {
          // falla silenciosa, deja solo marcadores/center
          console.error("Mapbox directions error", e);
        }
      } else {
        // Marker en center si no hay ruta
        new mapboxgl.Marker({ color: "#04BD88" })
          .setLngLat(initialCenter)
          .addTo(map);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [initialCenter, zoom, token, hasRoute, origin, destination]);

  return <div ref={containerRef} className={className} />;
}
