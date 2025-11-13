import { createClient } from "@/src/lib/supabase/server";

// El tipo de datos no cambia
export type AdminMapData = {
  // ... (mismo tipo que antes)
  drivers: Array<{ id: string; lng: number; lat: number }>;
  shipments: Array<{
    id: string;
    origin?: { longitude: number; latitude: number } | null;
    destination?: { longitude: number; latitude: number } | null;
    routeGeoJson?: {
      type: "LineString";
      coordinates: [number, number][];
    } | null;
  }>;
  partners: Array<{ id: string; name: string; lng: number; lat: number }>;
};

/**
 * Aplica un pequeño desplazamiento a los partners que comparten las mismas coordenadas.
 * Esto evita que los marcadores se superpongan exactamente en el mapa.
 * @param partners - Array de partners obtenidos de la base de datos.
 * @returns Un nuevo array de partners con las coordenadas ajustadas.
 */
function jitterOverlappingPartners(
  partners: AdminMapData["partners"]
): AdminMapData["partners"] {
  const JITTER_AMOUNT = 0.0001; // ~11 metros. Ajusta este valor si es necesario.
  const groups = new Map<string, AdminMapData["partners"]>();

  // 1. Agrupar partners por coordenadas
  for (const partner of partners) {
    const key = `${partner.lng},${partner.lat}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(partner);
  }

  const processedPartners: AdminMapData["partners"] = [];

  // 2. Procesar cada grupo
  for (const group of groups.values()) {
    // Si no hay superposición, añadir directamente
    if (group.length <= 1) {
      processedPartners.push(...group);
      continue;
    }

    console.log(
      `[getMapData:jitter] Encontrados ${group.length} partners en la misma ubicación. Aplicando jitter.`
    );

    // Si hay superposición, calcular el desplazamiento en círculo
    const numPoints = group.length;
    group.forEach((partner, index) => {
      const angle = (2 * Math.PI * index) / numPoints; // Distribuir en un círculo
      const newLng = partner.lng + JITTER_AMOUNT * Math.cos(angle);
      const newLat = partner.lat + JITTER_AMOUNT * Math.sin(angle);

      processedPartners.push({
        ...partner,
        lng: newLng,
        lat: newLat,
      });
    });
  }

  return processedPartners;
}

// ... (la función startOfUTCDay sigue igual)
function startOfUTCDay(d = new Date()): string {
  const dt = new Date(d);
  dt.setUTCHours(0, 0, 0, 0);
  return dt.toISOString();
}

export default async function getMapData(): Promise<AdminMapData> {
  const supabase = await createClient();
  const todayIso = startOfUTCDay();

  // --- 1. Obtener Partners usando la RPC ---
  let partners: AdminMapData["partners"] = [];
  try {
    const { data: partnersData, error: partnersError } = await supabase.rpc(
      "get_map_partners"
    );

    if (partnersError) {
      console.error("[getMapData:partners] Error en RPC:", partnersError);
    } else if (partnersData) {
      // AQUÍ ES DONDE APLICAMOS LA LÓGICA INTELIGENTE
      console.log(
        `[getMapData:partners] Recibidos ${partnersData.length} partners. Procesando superposiciones...`
      );
      partners = jitterOverlappingPartners(partnersData);
    }
  } catch (e) {
    console.error("[getMapData:partners] Excepción en RPC:", e);
  }

  // --- 2. Obtener Drivers y Shipments (sin cambios) ---
  let drivers: AdminMapData["drivers"] = [];
  // ... (la lógica para obtener drivers sigue igual)
  try {
    const { data } = await supabase
      .from("drivers")
      .select("id, current_location, status")
      .in("status", ["online", "in_delivery"]);
    drivers = (data || [])
      .map((d: any) => {
        const geom = d?.current_location;
        const coords = geom?.coordinates || geom?.coords;
        if (Array.isArray(coords) && coords.length >= 2) {
          const [lng, lat] = coords as [number, number];
          return { id: d.id, lng: Number(lng), lat: Number(lat) };
        }
        return null;
      })
      .filter(Boolean) as any;
  } catch {}

  let shipments: AdminMapData["shipments"] = [];
  // ... (la lógica para obtener shipments sigue igual)
  try {
    const { data } = await supabase
      .from("shipments")
      .select(
        "id, origin_coordinates, destination_coordinates, route_details, created_at"
      )
      .gte("created_at", todayIso)
      .order("created_at", { ascending: false })
      .limit(30);
    shipments = (data || []).map((s: any) => {
      const toLngLat = (p: any) => {
        const c = p?.coordinates || p?.coords;
        if (Array.isArray(c) && c.length >= 2) {
          return { longitude: Number(c[0]), latitude: Number(c[1]) };
        }
        return null;
      };
      const details = s?.route_details || {};
      const routeGeoJson = details?.routeGeoJson || null;
      return {
        id: s.id,
        origin: toLngLat(s?.origin_coordinates),
        destination: toLngLat(s?.destination_coordinates),
        routeGeoJson: routeGeoJson || null,
      };
    });
  } catch {}

  // --- 4. Combinar y devolver los resultados ---
  const result = { drivers, shipments, partners };
  console.log(
    `[getMapData] Resultado final: { drivers: ${result.drivers.length}, partners: ${result.partners.length} (procesados), shipments: ${result.shipments.length} }`
  );

  return result;
}
