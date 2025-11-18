"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface Props {
  origin: [number, number] | null;
  destination: [number, number] | null;
  eta: string;
}

export default function OrderDetailMap({ origin, destination, eta }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const center = destination || origin || [-74.059, 4.671]; // fallback coords

    const map = new mapboxgl.Map({
      container: ref.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 12,
    });
    mapRef.current = map;

    map.on("load", () => {
      if (origin) {
        new mapboxgl.Marker({ color: "#2196F3" }).setLngLat(origin).addTo(map);
      }
      if (destination) {
        new mapboxgl.Marker({ color: "#EF4444" })
          .setLngLat(destination)
          .addTo(map);
      }
      if (origin && destination) {
        map.fitBounds([origin, destination], { padding: 40, maxZoom: 14 });
        // Simple route line source
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [origin, destination],
            },
          },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#2990F6",
            "line-width": 4,
          },
        });
      }
    });

    return () => {
      map.remove();
    };
  }, [origin, destination]);

  return (
    <div className="relative w-full h-[201px] rounded-xl overflow-hidden mt-2">
      <div ref={ref} className="absolute inset-0" />
      <div className="absolute left-5 top-5 bg-white px-2 py-1 rounded-lg shadow text-[12px] font-bold">
        {eta}
      </div>
    </div>
  );
}
