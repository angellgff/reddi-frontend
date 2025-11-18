"use server";

import { createClient } from "@/src/lib/supabase/server";
import { calculateShipmentDetails } from "@/src/lib/shipping/calculateShipmentDetails";

export interface RouteDetailsResult {
  origin?: { longitude: number; latitude: number } | null;
  destination?: { longitude: number; latitude: number } | null;
  routeGeoJson?: { type: "LineString"; coordinates: [number, number][] } | null;
  distanceMeters?: number | null;
  durationSeconds?: number | null;
  shippingCost?: number | null;
}

export async function getRouteDetails(
  partnerId?: string | null,
  userAddressId?: string | null
): Promise<RouteDetailsResult> {
  try {
    if (!partnerId || !userAddressId) return {};
    const supabase = await createClient();
    const details = await calculateShipmentDetails(
      supabase as any,
      partnerId,
      userAddressId
    );
    return {
      origin: details.originCoordinates,
      destination: details.destinationCoordinates,
      routeGeoJson: details.routeGeoJson || null,
      distanceMeters: details.distanceMeters,
      durationSeconds: details.durationSeconds,
      shippingCost: details.shippingCost,
    };
  } catch (e) {
    // Silenciar errores y retornar objeto vacío para no romper el render SSR
    return {};
  }
}
