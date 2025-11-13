"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // <-- Importante: Añadir el CSS de Mapbox
import type { AdminMapData } from "@/src/lib/admin/data/dashboard/getMapData";

export default function AdminMap({
  data,
  height = 320,
}: {
  data: AdminMapData;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
    // No revelar el token; solo avisar ausencia
    console.warn("[AdminMap] NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN no configurado");
  }

  // 1. Efecto para inicializar el mapa (se ejecuta solo una vez)
  useEffect(() => {
    if (!containerRef.current) {
      console.warn("[AdminMap:init] containerRef.current es null");
      return;
    }
    if (!token) {
      console.warn("[AdminMap:init] Falta token de Mapbox. Abortando init.");
      return;
    }
    if (mapRef.current) {
      console.log("[AdminMap:init] Mapa ya inicializado. Skip.");
      return;
    } // Ya inicializado
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/navigation-day-v1",
      interactive: true,
      center: [-74.006, 40.7128], // Un centro por defecto
      zoom: 3,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      console.log(
        "[AdminMap:load] Estilo cargado. Añadiendo source y layer de rutas"
      );
      try {
        // Añade la fuente y la capa para las rutas una sola vez, con datos vacíos
        if (!map.getSource("admin-shipments")) {
          map.addSource("admin-shipments", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
        } else {
          console.log("[AdminMap:load] Source 'admin-shipments' ya existía");
        }
        if (!map.getLayer("admin-shipments-line")) {
          map.addLayer({
            id: "admin-shipments-line",
            type: "line",
            source: "admin-shipments",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#10b981",
              "line-width": 3,
              "line-opacity": 0.7,
            },
          });
        } else {
          console.log(
            "[AdminMap:load] Layer 'admin-shipments-line' ya existía"
          );
        }
      } catch (e) {
        console.error("[AdminMap:load] Error añadiendo source/layer:", e);
      }
    });

    map.on("error", (e) => {
      console.error(
        "[AdminMap:error] Evento de error del mapa:",
        e?.error || e
      );
    });

    mapRef.current = map;

    // Función de limpieza para destruir el mapa cuando el componente se desmonte
    return () => {
      console.log("[AdminMap:cleanup] Eliminando mapa y reseteando refs");
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  // 2. Efecto para actualizar los datos en el mapa (se ejecuta cuando `data` cambia)
  useEffect(() => {
    const map = mapRef.current;
    const isLoaded = map?.isStyleLoaded?.() ?? false;

    if (!map) {
      console.warn("[AdminMap:update] No hay instancia de mapa aún. Skip.");
      return;
    }
    if (!data) {
      console.warn("[AdminMap:update] 'data' es null/undefined. Skip.");
      return;
    }
    if (!isLoaded) {
      console.log(
        "[AdminMap:update] Estilo NO cargado aún. Esperando 'load' para aplicar datos."
      );
      map.once("load", () => {
        // Re-disparar lógica de actualización cuando cargue el estilo
        try {
          console.log(
            "[AdminMap:update->once(load)] Reintentando actualización tras load"
          );
          // Forzar una actualización re-ejecutando esta effect logic
          // Nota: no podemos invocar el effect directamente; repetimos el bloque mínimo
          applyDataToMap(map, data);
        } catch (e) {
          console.error(
            "[AdminMap:update->once(load)] Error aplicando datos:",
            e
          );
        }
      });
      return;
    }

    try {
      applyDataToMap(map, data);
    } catch (e) {
      console.error("[AdminMap:update] Error aplicando datos:", e);
    }

    function applyDataToMap(map: Map, data: AdminMapData) {
      console.log("[AdminMap:apply] Actualizando mapa con datos", {
        drivers: data?.drivers?.length ?? 0,
        partners: data?.partners?.length ?? 0,
        shipments: data?.shipments?.length ?? 0,
      });

      // Limpiar marcadores antiguos
      const removed = markersRef.current.length;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (removed) {
        console.log(
          `[AdminMap:apply] Eliminados ${removed} marcadores antiguos`
        );
      }

      const bounds = new mapboxgl.LngLatBounds();
      let hasAnyData = false;

      // Añadir marcadores de conductores
      if (Array.isArray(data.drivers)) {
        data.drivers.forEach((d, idx) => {
          if (typeof d.lng !== "number" || typeof d.lat !== "number") {
            console.warn(
              "[AdminMap:drivers] Coordenadas inválidas en índice",
              idx,
              d
            );
            return;
          }
          const marker = new mapboxgl.Marker({ color: "#0ea5e9" })
            .setLngLat([d.lng, d.lat])
            .addTo(map);
          markersRef.current.push(marker);
          bounds.extend([d.lng, d.lat]);
          hasAnyData = true;
        });
        console.log(
          `[AdminMap:drivers] Marcadores añadidos: ${markersRef.current.length}`
        );
      }

      // Añadir marcadores de socios
      if (Array.isArray(data.partners)) {
        const before = markersRef.current.length;
        data.partners.forEach((p, idx) => {
          if (typeof p.lng !== "number" || typeof p.lat !== "number") {
            console.warn(
              "[AdminMap:partners] Coordenadas inválidas en índice",
              idx,
              p
            );
            return;
          }
          const marker = new mapboxgl.Marker({ color: "#7c3aed" })
            .setLngLat([p.lng, p.lat])
            .setPopup(
              new mapboxgl.Popup({ closeButton: false }).setText(p.name)
            )
            .addTo(map);
          markersRef.current.push(marker);
          bounds.extend([p.lng, p.lat]);
          hasAnyData = true;
        });
        const added = markersRef.current.length - before;
        console.log(`[AdminMap:partners] Marcadores añadidos: ${added}`);
      }

      // Actualizar datos de las rutas (shipments)
      const source = map.getSource("admin-shipments") as
        | mapboxgl.GeoJSONSource
        | undefined;
      if (!source) {
        console.warn(
          "[AdminMap:shipments] Source 'admin-shipments' no encontrado"
        );
      } else {
        const features = (Array.isArray(data.shipments) ? data.shipments : [])
          .filter((s) => (s as any)?.routeGeoJson?.coordinates?.length)
          .map((s) => ({
            type: "Feature",
            geometry: (s as any).routeGeoJson as any,
          }));

        const featureCollection = {
          type: "FeatureCollection",
          features,
        } as const;
        try {
          source.setData(featureCollection as any);
          console.log(
            `[AdminMap:shipments] setData con ${features.length} features`
          );
        } catch (e) {
          console.error("[AdminMap:shipments] Error en setData:", e);
        }
      }

      // Incluir puntos de origen/destino en los límites del mapa
      let odCount = 0;
      (Array.isArray(data.shipments) ? data.shipments : []).forEach((s) => {
        if ((s as any)?.origin) {
          bounds.extend([
            (s as any).origin.longitude,
            (s as any).origin.latitude,
          ]);
          hasAnyData = true;
          odCount++;
        }
        if ((s as any)?.destination) {
          bounds.extend([
            (s as any).destination.longitude,
            (s as any).destination.latitude,
          ]);
          hasAnyData = true;
          odCount++;
        }
      });
      if (odCount) {
        console.log(
          `[AdminMap:shipments] Puntos O/D añadidos a bounds: ${odCount}`
        );
      }

      // Ajustar la vista del mapa para que quepan todos los puntos
      if (hasAnyData) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        console.log("[AdminMap:fitBounds] Ajustando vista", { ne, sw });
        map.fitBounds(bounds, { padding: 60, duration: 1000, maxZoom: 12 });
      } else {
        console.log("[AdminMap:fitBounds] Sin datos. No se ajusta vista.");
      }
    }
    // Limpiar marcadores antiguos
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const bounds = new mapboxgl.LngLatBounds();
    let hasAnyData = false;

    // Añadir marcadores de conductores
    data.drivers.forEach((d) => {
      const marker = new mapboxgl.Marker({ color: "#0ea5e9" })
        .setLngLat([d.lng, d.lat])
        .addTo(map);
      markersRef.current.push(marker);
      bounds.extend([d.lng, d.lat]);
      hasAnyData = true;
    });

    // Añadir marcadores de socios
    data.partners?.forEach((p) => {
      const marker = new mapboxgl.Marker({ color: "#7c3aed" })
        .setLngLat([p.lng, p.lat])
        .setPopup(new mapboxgl.Popup({ closeButton: false }).setText(p.name))
        .addTo(map);
      markersRef.current.push(marker);
      bounds.extend([p.lng, p.lat]);
      hasAnyData = true;
    });

    // Actualizar datos de las rutas (shipments)
    const source = map.getSource("admin-shipments") as mapboxgl.GeoJSONSource;
    if (source) {
      const features = data.shipments
        .filter((s) => s.routeGeoJson?.coordinates?.length)
        .map((s) => ({ type: "Feature", geometry: s.routeGeoJson as any }));

      const featureCollection = { type: "FeatureCollection", features };
      source.setData(featureCollection as any);
    }

    // Incluir puntos de origen/destino en los límites del mapa
    data.shipments.forEach((s) => {
      if (s.origin) {
        bounds.extend([s.origin.longitude, s.origin.latitude]);
        hasAnyData = true;
      }
      if (s.destination) {
        bounds.extend([s.destination.longitude, s.destination.latitude]);
        hasAnyData = true;
      }
    });

    // Ajustar la vista del mapa para que quepan todos los puntos
    if (hasAnyData) {
      map.fitBounds(bounds, { padding: 60, duration: 1000, maxZoom: 12 });
    }
  }, [data]);

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
