"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface LocationPickerMapProps {
  lat: number | null;
  lng: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  className?: string;
}

export default function LocationPickerMap({
  lat,
  lng,
  onLocationSelect,
  className = "h-64 w-full rounded-2xl overflow-hidden",
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("Falta la API Key de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)");
      return;
    }

    if (!containerRef.current || mapRef.current) return;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["maps", "marker"],
    });

    loader.load().then(async () => {
      const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      const { Marker } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

      const initialCenter = lng && lat ? { lat, lng } : { lat: 18.4861, lng: -69.9312 }; // Santo Domingo
      const initialZoom = lng && lat ? 15 : 12;

      const map = new Map(containerRef.current!, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeControl: false,
        streetViewControl: false,
      });

      mapRef.current = map;

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onLocationSelect(e.latLng.lat(), e.latLng.lng());
        }
      });

      // Initial marker
      if (lat && lng) {
         updateMarker(lat, lng, Marker);
      }
    }).catch((e) => {
      console.error("Google Maps load error", e);
      setError("Error al cargar Google Maps");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const updateMarker = async (latitude: number, longitude: number, MarkerClass?: typeof google.maps.Marker) => {
    if (!mapRef.current) return;
    
    // Ensure we have the Marker class if called outside init
    let M = MarkerClass;
    if (!M) {
         // Fallback if not passed, though in useEffect below it might be tricky. 
         // Actually google.maps.Marker is globally available after load.
         M = google.maps.Marker;
    }

    if (!markerRef.current) {
      markerRef.current = new M!({
        position: { lat: latitude, lng: longitude },
        map: mapRef.current,
      });
    } else {
      markerRef.current.setPosition({ lat: latitude, lng: longitude });
    }
  };

  // Update marker when props change
  useEffect(() => {
    if (lat && lng && mapRef.current) {
      updateMarker(lat, lng);
      mapRef.current.panTo({ lat, lng });
    }
  }, [lat, lng]);

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-red-500 text-sm p-4 ${className}`}>
        {error}
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}
