"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!token) {
      setError("Falta el token de Mapbox (NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)");
      return;
    }

    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    // Default center (Santo Domingo) if no location selected
    const initialCenter: [number, number] =
      lng && lat ? [lng, lat] : [-69.9312, 18.4861];
    const initialZoom = lng && lat ? 15 : 12;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: initialZoom,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add click listener
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      onLocationSelect(lat, lng);
    });

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token, lat, lng, onLocationSelect]);

  // Update marker when props change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !lat || !lng) return;

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: "#ef4444" }) // Red color
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }

    // Fly to location if it changed significantly? 
    // Maybe better not to fly automatically on every prop update to avoid annoying jumps if user is dragging (if we added drag).
    // But since we only update on click, flying to it is fine or just setting marker.
    // Let's just ensure the marker is there.
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
