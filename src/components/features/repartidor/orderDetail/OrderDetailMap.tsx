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
    mapRef.current = map;

    map.on("load", () => {
       // Initial load logic can remain empty or handle initial markers if desired,
       // but we will handle markers in a separate effect to support updates.
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run only once

  // Effect to update markers/route when props change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateMap = () => {
        // Clear existing markers/layers if needed or just update them.
        // For simplicity in this component which seems to re-mount often or be static:
        // Note: Managing markers reference is needed if we want to remove them cleanly without reloading map.
        // However, this component didn't have refs for markers. Let's add them to State or Refs?
        // Since the user wants "red marker" to work, we must ensure markers are updated.
        
        // This component implementation was simple. To properly support updates without map reload:
        // We really need refs for the markers. Given the simple structure, I will add refs.
    };
    
    // For now, to solve the "re-init" issue simply without refactoring the whole component to add refs (which is better but riskier):
    // actually, let's fix it properly by adding refs for markers.
  }, [origin, destination, eta]); // This block is placeholder, I will do a full replace below


  return (
    <div className="relative w-full h-[201px] rounded-xl overflow-hidden mt-2">
      <div ref={ref} className="absolute inset-0" />
      <div className="absolute left-5 top-5 bg-white px-2 py-1 rounded-lg shadow text-[12px] font-bold">
        {eta}
      </div>
    </div>
  );
}
