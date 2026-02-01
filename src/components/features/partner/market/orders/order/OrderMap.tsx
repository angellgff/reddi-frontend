"use client";

import React, { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

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
  const mapRef = useRef<google.maps.Map | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null,
  );

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasRoute = !!origin && !!destination;

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
      const { DirectionsRenderer } = (await google.maps.importLibrary(
        "routes",
      )) as google.maps.RoutesLibrary;

      const map = new Map(containerRef.current!, {
        center: { lat: center[0], lng: center[1] },
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        mapId: "ORDER_MAP_ID",
      });

      mapRef.current = map;

      directionsRendererRef.current = new DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#04BD88",
          strokeWeight: 5,
        },
      });

      updateMap(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    if (mapRef.current) {
      updateMap(mapRef.current);
    }
  }, [center, origin, destination, hasRoute]);

  const updateMap = async (map: google.maps.Map) => {
    if (hasRoute && origin && destination) {
      // Markers
      updateMarker(originMarkerRef, origin, "#04BD88", map);
      updateMarker(destMarkerRef, destination, "#222", map);

      // Directions
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: origin[0], lng: origin[1] },
          destination: { lat: destination[0], lng: destination[1] },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRendererRef.current?.setDirections(result);
          } else {
            console.error("Directions request failed due to " + status);
          }
        },
      );
    } else {
      // No route
      directionsRendererRef.current?.setDirections(null);
      if (!origin && !destination) {
        updateMarker(originMarkerRef, center, "#04BD88", map);
        destMarkerRef.current?.setMap(null);
        map.setCenter({ lat: center[0], lng: center[1] });
      }
    }
  };

  const updateMarker = (
    markerRef: React.MutableRefObject<google.maps.Marker | null>,
    pos: LatLng,
    color: string,
    map: google.maps.Map,
  ) => {
    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: { lat: pos[0], lng: pos[1] },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "white",
        },
      });
    } else {
      markerRef.current.setPosition({ lat: pos[0], lng: pos[1] });
      markerRef.current.setMap(map);
    }
  };

  if (!apiKey) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center text-sm p-4 ${className}`}
      >
        Mapa no disponible
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
