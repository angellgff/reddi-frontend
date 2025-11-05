"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl"; // Importa los tipos Map y Marker
import "mapbox-gl/dist/mapbox-gl.css";

type LngLat = { longitude: number; latitude: number };

export default function RouteMap({
  origin,
  destination,
  routeGeoJson,
  height = 260,
}: {
  origin: LngLat;
  destination: LngLat;
  routeGeoJson?: { type: "LineString"; coordinates: [number, number][] } | null;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  // Refs para los marcadores para poder limpiarlos si cambian las props
  const originMarkerRef = useRef<Marker | null>(null);
  const destinationMarkerRef = useRef<Marker | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const bounds = useMemo(() => {
    // Si tenemos una ruta, ajustamos los límites a la ruta completa
    if (routeGeoJson && routeGeoJson.coordinates.length > 0) {
      return routeGeoJson.coordinates.reduce(
        (b, coord) => b.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds()
      );
    }
    // Si no, solo a origen y destino
    const b = new mapboxgl.LngLatBounds();
    b.extend([origin.longitude, origin.latitude]);
    b.extend([destination.longitude, destination.latitude]);
    return b;
  }, [origin, destination, routeGeoJson]);

  useEffect(() => {
    if (!containerRef.current || !token) return;

    mapboxgl.accessToken = token;

    // Inicializa el mapa solo una vez
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: containerRef.current,
        // --- CAMBIO 1: Estilo de mapa para navegación ---
        style: "mapbox://styles/mapbox/navigation-day-v1",
        // --- CAMBIO 2: Habilitar interacción ---
        interactive: true,
      });
      // Añade controles de zoom y rotación
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    const map = mapRef.current;

    const handleLoad = () => {
      map.fitBounds(bounds, { padding: 60, duration: 0, maxZoom: 15 });

      // Gestionar la capa de la ruta
      const sourceId = "route";
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;

      if (routeGeoJson) {
        if (!source) {
          map.addSource(sourceId, {
            type: "geojson",
            data: { type: "Feature", geometry: routeGeoJson, properties: {} },
          });
          map.addLayer({
            id: "route-line",
            type: "line",
            source: sourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#04BD88",
              "line-width": 5,
            },
          });
        } else {
          source.setData({
            type: "Feature",
            geometry: routeGeoJson,
            properties: {},
          });
        }
      } else if (source) {
        // Si no hay ruta, limpiamos la capa
        map.removeLayer("route-line");
        map.removeSource(sourceId);
      }

      // Gestionar marcadores para que no se dupliquen en cada render
      if (originMarkerRef.current) originMarkerRef.current.remove();
      // --- CAMBIO 3 (Opcional): Intercambiar colores para que coincida con tu imagen ---
      originMarkerRef.current = new mapboxgl.Marker({ color: "#04BD88" }) // Origen ahora es verde
        .setLngLat([origin.longitude, origin.latitude])
        .addTo(map);

      if (destinationMarkerRef.current) destinationMarkerRef.current.remove();
      destinationMarkerRef.current = new mapboxgl.Marker({ color: "#1f2937" }) // Destino ahora es oscuro
        .setLngLat([destination.longitude, destination.latitude])
        .addTo(map);
    };

    if (map.isStyleLoaded()) {
      handleLoad();
    } else {
      map.on("load", handleLoad);
    }

    // No es necesario map.remove() aquí para que el mapa persista entre re-renders
    // Se eliminará cuando el componente se desmonte del DOM
  }, [bounds, origin, destination, routeGeoJson, token]);

  if (!token) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[#D9DCE3] text-sm text-gray-500"
        style={{ height }}
      >
        Mapa no disponible (falta token de Mapbox)
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-[#D9DCE3]"
      style={{ height }}
    />
  );
}
