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
  const originMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const hasRoute = !!origin && !!destination;

  // Convertir [lat, lng] -> [lng, lat]
  const toLngLat = (latlng: LatLng): [number, number] => [latlng[1], latlng[0]];

  // 1. Initialize Map
  useEffect(() => {
    if (!containerRef.current || !token) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = token;
    const initialCenterLngLat = toLngLat(center);

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenterLngLat,
      zoom,
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Init once

  // 2. Update Map Data (Markers & Route)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Helper to add/update/remove marker
    const updateMarker = (
      markerRef: React.MutableRefObject<mapboxgl.Marker | null>,
      position: LatLng | undefined,
      color: string
    ) => {
      if (position) {
        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({ color })
            .setLngLat(toLngLat(position))
            .addTo(map);
        } else {
          markerRef.current.setLngLat(toLngLat(position));
        }
      } else if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };

    const drawRoute = async () => {
      if (hasRoute && origin && destination) {
        updateMarker(originMarkerRef, origin, "#04BD88");
        updateMarker(destMarkerRef, destination, "#222");

        // Fetch & Draw Route
        try {
          const start = toLngLat(origin).join(",");
          const end = toLngLat(destination).join(",");
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&overview=full&access_token=${token}`;
          
          const res = await fetch(url);
          const json = await res.json();
          const route = json?.routes?.[0]?.geometry;

          if (route) {
            const sourceId = "route";
            const source = map.getSource(sourceId) as GeoJSONSource;
            
            if (!source) {
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
              source.setData({
                type: "Feature",
                properties: {},
                geometry: route,
              });
            }

             // Fit bounds
             const coords = route.coordinates as [number, number][];
             const bounds = coords.reduce(
               (b, c) => b.extend(c),
               new mapboxgl.LngLatBounds(coords[0], coords[0])
             );
             map.fitBounds(bounds, { padding: 40 });
          }
        } catch (e) {
          console.error("Mapbox route error", e);
        }
      } else {
        // No route -> Show Center Marker
         if (!origin && !destination) {
              if (!originMarkerRef.current) {
                 originMarkerRef.current = new mapboxgl.Marker({ color: "#04BD88" })
                   .setLngLat(toLngLat(center)) 
                   .addTo(map);
              } else {
                   originMarkerRef.current.setLngLat(toLngLat(center));
              }
              // Clear destination marker if it exists
              if (destMarkerRef.current) {
                  destMarkerRef.current.remove();
                  destMarkerRef.current = null;
              }
              // Clear route line
              const source = map.getSource("route") as GeoJSONSource;
              if (source) {
                  source.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } });
              }
         }
      }
    };

    if (map.loaded() || map.isStyleLoaded()) {
      drawRoute();
    } else {
      map.on("load", drawRoute);
    }
  }, [center, hasRoute, origin, destination, token]);

  return <div ref={containerRef} className={className} />;
}
