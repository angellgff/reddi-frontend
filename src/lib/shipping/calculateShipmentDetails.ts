import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

export interface ShipmentDetails {
  distanceMeters: number;
  durationSeconds: number;
  shippingCost: number;
  originCoordinates: { longitude: number; latitude: number };
  destinationCoordinates: { longitude: number; latitude: number };
  routeGeoJson?: { type: "LineString"; coordinates: [number, number][] };
}

// GeoJSON Point as returned by Supabase for PostGIS geography(Point)
type GeoJsonPoint =
  | { type: "Point"; coordinates: [number, number] }
  | null
  | undefined;

/**
 * Enhanced toLngLat function with detailed debugging logs.
 * It will print the exact reason if parsing fails.
 */
function toLngLat(
  point: GeoJsonPoint,
  label: string // A label to identify which coordinate is being processed
): { longitude: number; latitude: number } | null {
  console.log(
    `[DEBUG toLngLat] Processing '${label}' with input:`,
    JSON.stringify(point)
  );

  if (!point) {
    console.warn(
      `[DEBUG toLngLat] Failed for '${label}': Input object is null or undefined.`
    );
    return null;
  }
  if (point.type !== "Point") {
    console.warn(
      `[DEBUG toLngLat] Failed for '${label}': Expected type 'Point' but got '${point.type}'.`
    );
    return null;
  }
  if (!Array.isArray(point.coordinates) || point.coordinates.length !== 2) {
    console.warn(
      `[DEBUG toLngLat] Failed for '${label}': 'coordinates' property is not an array with two elements.`,
      { coordinates: point.coordinates }
    );
    return null;
  }

  const [longitude, latitude] = point.coordinates;

  if (typeof longitude !== "number" || typeof latitude !== "number") {
    console.warn(
      `[DEBUG toLngLat] Failed for '${label}': Longitude or Latitude are not of type 'number'.`,
      {
        longitude: { value: longitude, type: typeof longitude },
        latitude: { value: latitude, type: typeof latitude },
      }
    );
    return null;
  }

  const result = { longitude, latitude };
  console.log(`[DEBUG toLngLat] Success for '${label}':`, result);
  return result;
}

function point(
  lng: number,
  lat: number
): { type: "Point"; coordinates: [number, number] } {
  return { type: "Point", coordinates: [lng, lat] };
}

async function geocodeWithMapbox(
  query: string,
  token: string
): Promise<{ longitude: number; latitude: number } | null> {
  try {
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json`
    );
    url.searchParams.set("access_token", token);
    url.searchParams.set("limit", "1");
    const resp = await fetch(url.toString());
    if (!resp.ok) return null;
    const json: any = await resp.json();
    const feat = json?.features?.[0];
    const center = feat?.center;
    if (
      Array.isArray(center) &&
      typeof center[0] === "number" &&
      typeof center[1] === "number"
    ) {
      return { longitude: center[0], latitude: center[1] };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Calculate shipment details (distance, duration, and cost) between a partner origin and a user address destination.
 *
 * Contract
 * - Inputs: supabase client, partnerId, userAddressId
 * - Output: { distanceMeters, durationSeconds, shippingCost, originCoordinates, destinationCoordinates }
 * - Errors: throws Error with user-friendly messages on missing data or external API failure
 */
export async function calculateShipmentDetails(
  supabase: SupabaseClient<Database>,
  partnerId: string,
  userAddressId: string
): Promise<ShipmentDetails> {
  console.log("[shipping] calculateShipmentDetails start", {
    partnerId,
    userAddressId,
  });
  const token =
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Map service is not configured.");
  }
  console.log("[shipping] Mapbox token present:", Boolean(token));

  // 1) Fetch coordinates using RPC functions to get proper GeoJSON
  const [partnerRes, addressRes] = await Promise.all([
    supabase.rpc("get_partner_details", { p_id: partnerId }).single(),
    supabase
      .rpc("get_user_address_details", { addr_id: userAddressId })
      .single(),
  ]);

  // --- LOGS DE DEPURACIÓN (ahora deberían mostrar GeoJSON) ---
  console.log(
    "[DEBUG] Raw Supabase partner response data (from RPC):",
    JSON.stringify(partnerRes.data, null, 2)
  );
  console.log(
    "[DEBUG] Raw Supabase address response data (from RPC):",
    JSON.stringify(addressRes.data, null, 2)
  );
  // --- FIN DE LOGS ---

  if (partnerRes.error) {
    console.warn("[shipping] partner fetch error (RPC)", partnerRes.error);
    throw new Error("Origin address not found.");
  }
  if (addressRes.error) {
    console.warn("[shipping] address fetch error (RPC)", addressRes.error);
    throw new Error("Destination address not found.");
  }

  // Ahora `partnerRes.data.coordinates` será un objeto GeoJSON, no un string
  const partnerCoordsRaw = partnerRes.data?.coordinates;
  const addressCoordsRaw = addressRes.data?.coordinates;

  let origin = toLngLat(partnerCoordsRaw as GeoJsonPoint, "Origin (Partner)");
  let destination = toLngLat(
    addressCoordsRaw as GeoJsonPoint,
    "Destination (User)"
  );

  console.log("[DEBUG] Status after parsing from DB:", {
    originFound: !!origin,
    destinationFound: !!destination,
  });
  // --- FIN DE NUEVO LOG ---

  // 1.a) Fallback geocoding if coordinates are missing
  if (!origin) {
    console.log(
      "[shipping] Origin coordinates missing or invalid, attempting fallback geocoding."
    );
    const partnerAddress = (partnerRes.data as any)?.address as string | null;
    if (partnerAddress && typeof partnerAddress === "string") {
      console.log("[shipping] geocoding partner by address", {
        partnerAddress,
      });
      const geo = await geocodeWithMapbox(partnerAddress, token);
      if (geo) {
        console.log("[shipping] partner geocoded", geo);
        origin = geo;
        // Best-effort persist back to DB (ignore errors)
        await supabase
          .from("partners")
          .update({ coordinates: point(geo.longitude, geo.latitude) } as any)
          .eq("id", partnerId);
      } else {
        console.warn("[shipping] partner geocoding failed");
      }
    }
  }

  if (!destination) {
    console.log(
      "[shipping] Destination coordinates missing or invalid, attempting fallback geocoding."
    );
    const lt = (addressRes.data as any)?.location_type as string | undefined;
    const ln = (addressRes.data as any)?.location_number as string | undefined;
    if (lt && ln) {
      const query = `${lt} ${ln}, Cap Cana, Punta Cana, Dominican Republic`;
      console.log("[shipping] geocoding user address", { query, lt, ln });
      const geo = await geocodeWithMapbox(query, token);
      if (geo) {
        console.log("[shipping] address geocoded", geo);
        destination = geo;
        await supabase
          .from("user_addresses")
          .update({ coordinates: point(geo.longitude, geo.latitude) } as any)
          .eq("id", userAddressId);
      } else {
        console.warn("[shipping] address geocoding failed");
      }
    }
  }

  if (!origin || !destination) {
    // Mensaje de error más específico para saber si falló después de todos los intentos
    throw new Error(
      "Origin or destination address not found after all attempts."
    );
  }

  // 2) Call Mapbox Directions API
  const originParam = `${origin.longitude},${origin.latitude}`;
  const destinationParam = `${destination.longitude},${destination.latitude}`;

  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${originParam};${destinationParam}`
  );
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("access_token", token);

  const urlForLog = new URL(url.toString());
  urlForLog.searchParams.set("access_token", "***");
  console.log("[shipping] directions request", {
    origin,
    destination,
    url: urlForLog.toString(),
  });

  let routeJson: any;
  try {
    const resp = await fetch(url.toString(), { method: "GET" });
    if (!resp.ok) {
      console.warn("[shipping] directions http error", resp.status);
      throw new Error(`HTTP ${resp.status}`);
    }
    routeJson = await resp.json();
    console.log("[shipping] directions response code", routeJson?.code);
  } catch (e: any) {
    console.error("[shipping] directions failed", e?.message);
    throw new Error("Failed to calculate the route.");
  }

  if (
    !routeJson ||
    routeJson.code !== "Ok" ||
    !Array.isArray(routeJson.routes)
  ) {
    // Manejar el caso "NoRoute" con un mensaje más claro
    if (routeJson?.code === "NoRoute") {
      console.warn("[shipping] directions API responded with NoRoute");
      throw new Error(
        "A driving route could not be found between the origin and destination."
      );
    }
    throw new Error("Failed to calculate the route.");
  }
  const firstRoute = routeJson.routes[0];
  if (!firstRoute) {
    throw new Error("Failed to calculate the route.");
  }

  const distanceMeters = Number(firstRoute.distance);
  const durationSeconds = Number(firstRoute.duration);
  console.log("[shipping] route metrics", { distanceMeters, durationSeconds });
  if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds)) {
    throw new Error("Failed to calculate the route.");
  }

  // 4) Calculate shipping cost from active pricing rule
  const { data: rule, error: ruleError } = await supabase
    .from("delivery_pricing_rules")
    .select("base_fee, fee_per_kilometer, min_fee, is_active")
    .eq("is_active", true)
    .single();

  if (ruleError || !rule) {
    throw new Error("Shipping pricing is not configured.");
  }

  const distanceKm = distanceMeters / 1000;
  const base = Number((rule as any).base_fee ?? 0);
  const perKm = Number((rule as any).fee_per_kilometer ?? 0);
  const minFee = Number((rule as any).min_fee ?? 0);

  let computed = base + distanceKm * perKm;
  computed = Math.max(computed, minFee);
  const shippingCost = Number(computed.toFixed(2));

  console.log("[shipping] pricing", {
    base,
    perKm,
    minFee,
    distanceKm,
    shippingCost,
  });

  // 5) Return
  return {
    distanceMeters,
    durationSeconds,
    shippingCost,
    originCoordinates: origin,
    destinationCoordinates: destination,
    routeGeoJson: firstRoute.geometry as {
      type: "LineString";
      coordinates: [number, number][];
    },
  };
}
