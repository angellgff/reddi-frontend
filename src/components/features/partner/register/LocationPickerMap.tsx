"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface LocationPickerMapProps {
  lat: number | null;
  lng: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  className?: string;
  hideSearch?: boolean;
}

export default function LocationPickerMap({
  lat,
  lng,
  onLocationSelect,
  className = "h-64 w-full rounded-2xl overflow-hidden",
  hideSearch = false,
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError(
        "Falta la API Key de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)",
      );
      return;
    }

    if (!containerRef.current || mapRef.current) return;

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["maps", "marker", "places"],
    });

    loader
      .load()
      .then(async () => {
        const { Map } = (await google.maps.importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;
        const { Marker } = (await google.maps.importLibrary(
          "marker",
        )) as google.maps.MarkerLibrary;
        const { Autocomplete } = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;

        const initialCenter =
          lng && lat ? { lat, lng } : { lat: 18.4273, lng: -68.9728 }; // La Romana
        const initialZoom = lng && lat ? 15 : 13;

        const map = new Map(containerRef.current!, {
          center: initialCenter,
          zoom: initialZoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        mapRef.current = map;

        // Autocomplete setup
        if (searchInputRef.current) {
          const autocomplete = new Autocomplete(searchInputRef.current, {
            fields: ["geometry", "name"],
            types: ["geocode", "establishment"],
          });
          autocomplete.bindTo("bounds", map);

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
              return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
              map.fitBounds(place.geometry.viewport);
            } else {
              map.setCenter(place.geometry.location);
              map.setZoom(17);
            }

            const newLat = place.geometry.location.lat();
            const newLng = place.geometry.location.lng();

            updateMarker(newLat, newLng, Marker);
            onLocationSelect(newLat, newLng);
          });
        }

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onLocationSelect(e.latLng.lat(), e.latLng.lng());
          }
        });

        // Initial marker
        if (lat && lng) {
          updateMarker(lat, lng, Marker);
        }
      })
      .catch((e) => {
        console.error("Google Maps load error", e);
        setError("Error al cargar Google Maps");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const updateMarker = async (
    latitude: number,
    longitude: number,
    MarkerClass?: typeof google.maps.Marker,
  ) => {
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
      <div
        className={`bg-gray-100 flex items-center justify-center text-red-500 text-sm p-4 ${className}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {!hideSearch && (
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar dirección..."
          className="absolute top-4 left-1/2 -translate-x-1/2 w-[65%] max-w-xs h-10 bg-white rounded-full px-4 shadow-xl text-sm font-medium text-gray-700 outline-none border-0 placeholder:text-gray-400 z-0 focus:ring-2 focus:ring-primary/20 transition-all"
          style={{ zIndex: 5 }}
        />
      )}
    </div>
  );
}
