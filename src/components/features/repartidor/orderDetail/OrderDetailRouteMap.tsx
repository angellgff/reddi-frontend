"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

type Coords = [number, number]; // [lng, lat]

interface Props {
  origin: Coords | null;
  destination: Coords | null;
  driverLocation: Coords | null;
}

export default function OrderDetailRouteMap({
  origin,
  destination,
  driverLocation,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setMapError("API Key no configurada");
        return;
      }

      if (!mapRef.current) return;

      try {
        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places", "geometry", "routes"],
        });

        const { Map } = await loader.importLibrary("maps");
        const { DirectionsService, DirectionsRenderer } = await loader.importLibrary("routes") as google.maps.RoutesLibrary;

        const map = new Map(mapRef.current, {
          center: { lat: 18.4861, lng: -69.9312 }, // Default fallback (Santo Domingo)
          zoom: 13,
          disableDefaultUI: true, // Clean look like design
          styles: [
             {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
             }
          ]
        });

        const directionsRenderer = new DirectionsRenderer({
          map,
          suppressMarkers: false, // We can let Google handle markers or customize them
          polylineOptions: {
            strokeColor: "#4285F4", // Google Blue-ish
            strokeWeight: 5,
          },
        });

        googleMapRef.current = map;
        directionsRendererRef.current = directionsRenderer;
        
        // Calculate Route if points exist
        if (origin && destination) {
           const directionsService = new DirectionsService();
           
           const originLatLng = { lat: origin[1], lng: origin[0] };
           const destLatLng = { lat: destination[1], lng: destination[0] };

           directionsService.route(
             {
               origin: originLatLng,
               destination: destLatLng,
               travelMode: google.maps.TravelMode.DRIVING,
             },
             (result, status) => {
               if (status === google.maps.DirectionsStatus.OK && result) {
                 directionsRenderer.setDirections(result);
               } else {
                 console.error("Directions request failed due to " + status);
               }
             }
           );
        }

      } catch (error) {
        console.error("Error loading map:", error);
        setMapError("Error al cargar el mapa");
      }
    };

    initMap();
  }, [origin, destination]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
        {mapError}
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
