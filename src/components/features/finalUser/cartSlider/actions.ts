"use server";

import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
export type PartnerBasics = Pick<
  PartnerRow,
  "id" | "name" | "image_url" | "address" | "partner_type"
>;

/**
 * Server action: carga datos básicos del partner para el carrito.
 * - Sólo se ejecuta en el servidor (Supabase server client)
 * - Devuelve null si no hay partnerId o si ocurre algún error.
 */
export async function fetchPartnerBasics(
  partnerId: string | undefined | null
): Promise<PartnerBasics | null> {
  if (!partnerId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, image_url, address, partner_type")
    .eq("id", partnerId)
    .maybeSingle();
  if (error || !data) {
    console.warn("[fetchPartnerBasics] Error cargando partner", {
      partnerId,
      error,
    });
    return null;
  }
  return data as PartnerBasics;
}
