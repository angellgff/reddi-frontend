"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Props {
  origin: [number, number] | null; // [lng, lat]
  destination: [number, number] | null; // [lng, lat]
  eta: string;
}

export default function OrderDetailMap({ origin, destination, eta }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
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

      // Initial center
      let center = { lat: 4.671, lng: -74.059 }; // Fallback
      if (destination) center = { lat: destination[1], lng: destination[0] };
      else if (origin) center = { lat: origin[1], lng: origin[0] };

      const map = new Map(ref.current!, {
        center,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        mapId: "ORDER_DETAIL_MAP_ID",
      });

      mapRef.current = map;
      updateMap(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    if (mapRef.current) {
      updateMap(mapRef.current);
    }
  }, [origin, destination]);

  const updateMap = (map: google.maps.Map) => {
    // Clear
    originMarkerRef.current?.setMap(null);
    destMarkerRef.current?.setMap(null);
    polylineRef.current?.setMap(null);

    const bounds = new google.maps.LatLngBounds();

    // Origin (Blue)
    if (origin) {
      const pos = { lat: origin[1], lng: origin[0] };
      originMarkerRef.current = new google.maps.Marker({
        position: pos,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#2196F3",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "white",
        },
      });
      bounds.extend(pos);
    }

    // Destination (Red)
    if (destination) {
      const pos = { lat: destination[1], lng: destination[0] };
      destMarkerRef.current = new google.maps.Marker({
        position: pos,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#EF4444",
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "white",
        },
      });
      bounds.extend(pos);
    }

    // Route Line
    if (origin && destination) {
      const path = [
        { lat: origin[1], lng: origin[0] },
        { lat: destination[1], lng: destination[0] },
      ];
      // Simple straight line
      polylineRef.current = new google.maps.Polyline({
        path: path,
        map: map,
        strokeColor: "#2990F6",
        strokeWeight: 4,
      });

      map.fitBounds(bounds);
    } else if (origin || destination) {
      map.setCenter(bounds.getCenter());
    }
  };

  return (
    <div className="relative w-full h-[201px] rounded-xl overflow-hidden mt-2">
      <div ref={ref} className="absolute inset-0" />
    </div>
  );
}
