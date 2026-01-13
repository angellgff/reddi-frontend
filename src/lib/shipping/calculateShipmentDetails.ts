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

async function geocodeWithGoogle(
  query: string,
  key: string
): Promise<{ longitude: number; latitude: number } | null> {
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", query);
    url.searchParams.set("key", key);
    
    const resp = await fetch(url.toString());
    if (!resp.ok) return null;
    
    const json = await resp.json();
    if (json.status !== "OK" || !json.results?.[0]) return null;
    
    const location = json.results[0].geometry.location;
    // Google returns { lat, lng }
    if (typeof location.lng === "number" && typeof location.lat === "number") {
      return { longitude: location.lng, latitude: location.lat };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Decodes an encoded polyline string into an array of [longitude, latitude] coordinates.
 * Adapted from standard polyline decoding algorithms.
 */
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
      let b, shift = 0, result = 0;
      do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
          b = encoded.charCodeAt(index++) - 63;
          result |= (b & 0x1f) << shift;
          shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      // Google maps returns (lat, lng), but GeoJSON expects (lng, lat)
      poly.push([lng / 1e5, lat / 1e5]);
  }
  return poly;
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
  const token = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!token) {
    throw new Error("Map service is not configured.");
  }
  console.log("[shipping] Google Maps token present:", Boolean(token));

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
    const partnerAddress = partnerRes.data?.address;
    if (partnerAddress && typeof partnerAddress === "string") {
      console.log("[shipping] geocoding partner by address", {
        partnerAddress,
      });
      const geo = await geocodeWithGoogle(partnerAddress, token);
      if (geo) {
        console.log("[shipping] partner geocoded", geo);
        origin = geo;
        // Best-effort persist back to DB (ignore errors)
        await supabase
          .from("partners")
          .update({ coordinates: point(geo.longitude, geo.latitude) })
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
    const lt = addressRes.data?.location_type;
    const ln = addressRes.data?.location_number;
    if (lt && ln) {
      const query = `${lt} ${ln}, Cap Cana, Punta Cana, Dominican Republic`;
      console.log("[shipping] geocoding user address", { query, lt, ln });
      const geo = await geocodeWithGoogle(query, token);
      if (geo) {
        console.log("[shipping] address geocoded", geo);
        destination = geo;
        await supabase
          .from("user_addresses")
          .update({ coordinates: point(geo.longitude, geo.latitude) })
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

  // 2) Call Google Maps Directions API
  const originParam = `${origin.latitude},${origin.longitude}`; // Google uses lat,lng
  const destinationParam = `${destination.latitude},${destination.longitude}`;

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", originParam);
  url.searchParams.set("destination", destinationParam);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("key", token);

  const urlForLog = new URL(url.toString());
  urlForLog.searchParams.set("key", "***");
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
    console.log("[shipping] directions response status", routeJson?.status);
    if (routeJson?.error_message) {
      console.error("[shipping] directions API error message:", routeJson.error_message);
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[shipping] directions failed", message);
    throw new Error("Failed to calculate the route.");
  }

  if (
    !routeJson ||
    routeJson.status !== "OK" ||
    !Array.isArray(routeJson.routes)
  ) {
    // Handle "ZERO_RESULTS" (equivalent to Mapbox NoRoute)
    if (routeJson?.status === "ZERO_RESULTS") {
      console.warn("[shipping] directions API responded with ZERO_RESULTS");
      throw new Error(
        "A driving route could not be found between the origin and destination."
      );
    }
    throw new Error("Failed to calculate the route.");
  }
  const firstRoute = routeJson.routes[0];
  if (!firstRoute || !firstRoute.legs?.[0]) {
    throw new Error("Failed to calculate the route.");
  }

  const leg = firstRoute.legs[0];
  const distanceMeters = leg.distance.value;
  const durationSeconds = leg.duration.value;
  const routeCoordinates = decodePolyline(firstRoute.overview_polyline.points);
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
  const base = Number(rule.base_fee ?? 0);
  const perKm = Number(rule.fee_per_kilometer ?? 0);
  const minFee = Number(rule.min_fee ?? 0);

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
    routeGeoJson: {
      type: "LineString",
      coordinates: routeCoordinates,
    },
  };
}
