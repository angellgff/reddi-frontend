"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { createClient } from "@/src/lib/supabase/client";
import { Database } from "@/src/lib/database.types";

type Driver = Database["public"]["Tables"]["drivers"]["Row"];

interface DeliveryMapProps {
  shipment: {
    id: string;
    origin_coordinates: any;
    destination_coordinates: any;
    driver_id?: string | null;
  };
  // Allow overriding coordinates if shipment data is unreliable
  forcedOrigin?: { latitude: number; longitude: number } | null;
  forcedDestination?: { latitude: number; longitude: number } | null;

  googleMapsApiKey?: string;
  className?: string;
}

export default function DeliveryMap({
  shipment,
  forcedOrigin,
  forcedDestination,
  googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  className = "w-full h-96 rounded-lg shadow-md",
}: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const originMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const supabase = createClient();

  // Debug Log: Component Mount
  useEffect(() => {
    console.log("[DeliveryMap] Mounted with props:", {
      shipmentId: shipment.id,
      driverId: shipment.driver_id,
      origin: shipment.origin_coordinates,
      destination: shipment.destination_coordinates,
    });
  }, [shipment]);

  // Helper to parse location from DB (WKT or GeoJSON or object)
  const parseCoordinates = (
    coord: any,
  ): { lat: number; lng: number } | null => {
    if (!coord) return null;

    // Case 1: WKT string "POINT(-70.123 18.456)"
    if (typeof coord === "string" && coord.startsWith("POINT")) {
      const match = coord.match(/-?\d+(\.\d+)?/g);
      if (match && match.length >= 2) {
        const result = { lng: parseFloat(match[0]), lat: parseFloat(match[1]) };
        // console.log("[DeliveryMap] Parsed WKT:", coord, "->", result);
        return result;
      }
    }

    // Case 2: GeoJSON object { type: 'Point', coordinates: [lng, lat] }
    if (
      typeof coord === "object" &&
      coord.coordinates &&
      Array.isArray(coord.coordinates)
    ) {
      const result = { lng: coord.coordinates[0], lat: coord.coordinates[1] };
      // console.log("[DeliveryMap] Parsed GeoJSON:", coord, "->", result);
      return result;
    }

    // Case 3: Simple object { lat, lng } or { x, y }
    if (typeof coord === "object") {
      if ("lat" in coord && "lng" in coord) return coord;
      if ("latitude" in coord && "longitude" in coord)
        return { lat: coord.latitude, lng: coord.longitude };
    }

    // Case 4: WKB Hex string (Generic PostGIS Hex for Point)
    // Example: 0101000020E6100000... (50 chars for Point)
    if (
      typeof coord === "string" &&
      /^[0-9A-Fa-f]+$/.test(coord) &&
      coord.length === 50
    ) {
      try {
        // Helper to convert hex chunk to DataView
        const hexToDataView = (hex: string) => {
          const buffer = new ArrayBuffer(8); // Double precision is 8 bytes
          const view = new DataView(buffer);
          // Assuming Little Endian input stream for PostGIS WKB (byte 0 = 01)
          // We need to write bytes into the buffer in the order they appear called "littleEndian"
          // Actually, let's just create Uint8Array and map directly.
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < 8; i++) {
            bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
          }
          return view;
        };

        // Skip header:
        // Byte 0: Endianness (01 = Little)
        // Byte 1-4: Type (01000020 = Point + SRID)
        // Byte 5-8: SRID (E6100000 = 4326)
        // Total header = 1 + 4 + 4 = 9 bytes = 18 hex chars.

        const xHex = coord.substring(18, 34); // Next 8 bytes (16 chars) -> Longitude
        const yHex = coord.substring(34, 50); // Next 8 bytes (16 chars) -> Latitude

        const xView = hexToDataView(xHex);
        const yView = hexToDataView(yHex);

        const lng = xView.getFloat64(0, true); // true = Little Endian read
        const lat = yView.getFloat64(0, true);

        const result = { lat, lng };
        // console.log("[DeliveryMap] Parsed WKB Hex:", coord, "->", result);
        return result;
      } catch (e) {
        console.warn("[DeliveryMap] Parsing WKB failed:", e);
      }
    }

    console.warn("[DeliveryMap] Failed to parse coordinates:", coord);
    return null;
  };

  const origin = forcedOrigin
    ? { lat: forcedOrigin.latitude, lng: forcedOrigin.longitude }
    : parseCoordinates(shipment.origin_coordinates);

  const destination = forcedDestination
    ? { lat: forcedDestination.latitude, lng: forcedDestination.longitude }
    : parseCoordinates(shipment.destination_coordinates);

  // 1. Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || !googleMapsApiKey) return;

    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
      libraries: ["places", "geometry", "marker"],
    });

    loader
      .load()
      .then(async () => {
        const { Map } = (await google.maps.importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;

        // Default center (Santo Domingo aprox if nothing else)
        const defaultCenter = { lat: 18.4861, lng: -69.9312 };

        const newMap = new Map(mapRef.current as HTMLElement, {
          center: origin || defaultCenter,
          zoom: 13,
          mapId: "DELIVERY_MAP_ID", // Optional map ID for advanced markers
          disableDefaultUI: false,
        });

        setMap(newMap);
      })
      .catch((err) => {
        console.error("Error loading Google Maps", err);
      });
  }, [googleMapsApiKey]);

  // 2. Setup Markers & Polyline
  useEffect(() => {
    if (!map) return;

    // Origin Marker
    if (origin && !originMarkerRef.current) {
      originMarkerRef.current = new google.maps.Marker({
        position: origin,
        map,
        title: "Origen",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2563EB", // Blue
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
      });
    }

    // Destination Marker
    if (destination && !destMarkerRef.current) {
      destMarkerRef.current = new google.maps.Marker({
        position: destination,
        map,
        title: "Destino",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#EF4444", // Red
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
      });
    }

    // Driver Marker (Initial)
    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new google.maps.Marker({
        map,
        title: "Repartidor",
        // Custom icon for driver (motorcycle or car)
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z", // Simple map pin for now
          fillColor: "#10B981", // Green
          fillOpacity: 1,
          strokeWeight: 1,
          scale: 1.5,
          anchor: new google.maps.Point(12, 22),
        },
      });
    }

    // Fit Bounds
    const bounds = new google.maps.LatLngBounds();
    if (origin) bounds.extend(origin);
    if (destination) bounds.extend(destination);
    if (driverLocation) bounds.extend(driverLocation);

    if (origin || destination) {
      map.fitBounds(bounds);
    }

    // Polyline (Connect Origin -> Destination)
    if (origin && destination && !polylineRef.current) {
      polylineRef.current = new google.maps.Polyline({
        path: [origin, destination],
        geodesic: true,
        strokeColor: "#6B7280",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: map,
      });
    }
  }, [map, origin, destination]);

  // 3. Update Driver Marker Position
  useEffect(() => {
    if (driverLocation && map) {
      if (!driverMarkerRef.current) {
        console.log(
          "[DeliveryMap] Creating driver marker for first time at:",
          driverLocation,
        );
        driverMarkerRef.current = new google.maps.Marker({
          map,
          title: "Repartidor",
          position: driverLocation,
          icon: {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#10B981",
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 1.5,
            anchor: new google.maps.Point(12, 22),
          },
          zIndex: 999, // Ensure it's on top
        });
      } else {
        console.log(
          "[DeliveryMap] Updating existing marker to:",
          driverLocation,
        );
        driverMarkerRef.current.setPosition(driverLocation);
      }
    }
  }, [driverLocation, map]);

  // 4. Initial Fetch & Realtime Subscription
  useEffect(() => {
    if (!shipment.driver_id) {
      console.log(
        "[DeliveryMap] No driver_id provided, skipping realtime tracking.",
      );
      return;
    }

    // Fetch initial location
    const fetchDriverLocation = async () => {
      console.log(
        "[DeliveryMap] Fetching initial location for driver:",
        shipment.driver_id,
      );
      const { data, error } = await supabase
        .from("drivers")
        .select("current_location")
        .eq("id", shipment.driver_id!)
        .single();

      if (error) {
        console.error("[DeliveryMap] Error fetching initial location:", error);
      } else if (data && data.current_location) {
        console.log(
          "[DeliveryMap] Initial location received:",
          data.current_location,
        );
        const parsed = parseCoordinates(data.current_location);
        if (parsed) setDriverLocation(parsed);
      } else {
        console.log("[DeliveryMap] No initial location data found.");
      }
    };

    fetchDriverLocation();

    // Subscribe to changes
    console.log(
      "[DeliveryMap] Subscribing to driver updates:",
      shipment.driver_id,
    );
    const channel = supabase
      .channel(`driver-tracking-${shipment.driver_id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
          filter: `id=eq.${shipment.driver_id}`,
        },
        (payload) => {
          console.log("[DeliveryMap] Realtime UPDATE received:", payload);
          const newRow = payload.new as Driver;
          if (newRow.current_location) {
            const parsed = parseCoordinates(newRow.current_location);
            if (parsed) {
              setDriverLocation(parsed);
            }
          }
        },
      )
      .subscribe((status) => {
        console.log("[DeliveryMap] Subscription status:", status);
      });

    return () => {
      console.log("[DeliveryMap] Unsubscribing channel");
      supabase.removeChannel(channel);
    };
  }, [shipment.driver_id, supabase]);

  if (!googleMapsApiKey) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800">
        Falta la API Key de Google Maps
      </div>
    );
  }

  return (
    <div className={className} ref={mapRef}>
      {/* Map will render here */}
    </div>
  );
}
