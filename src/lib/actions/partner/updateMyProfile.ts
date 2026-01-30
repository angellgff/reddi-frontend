"use server";

import { createClient } from "@/src/lib/supabase/server";
import type { Database, Json } from "@/src/lib/database.types";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];

export type UpdateMyProfilePayload = {
  id: string;
  name?: string;
  isPhysical?: boolean;
  address?: string;
  category?: "market" | "restaurant" | "liquor_store";
  phone?: string;
  email?: string;
  hours?: Record<string, { active: boolean; opens: string; closes: string }>;
  lat?: number | null;
  lng?: number | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  bank_document_url?: string | null;
  estimated_time?: string | null;
};

function mapUiCategoryToDb(
  partnerCategory?: UpdateMyProfilePayload["category"],
): PartnerRow["partner_type"] | undefined {
  if (!partnerCategory) return undefined;
  return partnerCategory === "liquor_store" ? "liquor_store" : partnerCategory;
}

function createWKBPoint(lat: number, lng: number): string {
  // WKB Point (Little Endian)
  // 1 byte: 01 (Little Endian)
  // 4 bytes: 01000020 (Point type + SRID flag) -> 20000001 (Little Endian)
  // 4 bytes: E6100000 (SRID 4326) -> 4326 = 0x10E6 -> E6100000 (Little Endian)
  // 8 bytes: X (lng)
  // 8 bytes: Y (lat)

  const buffer = new ArrayBuffer(25);
  const view = new DataView(buffer);

  // Byte order: Little Endian
  view.setUint8(0, 1);

  // Type: Point (1) | SRID (0x20000000) => 0x20000001
  view.setUint32(1, 0x20000001, true);

  // SRID: 4326
  view.setUint32(5, 4326, true);

  // Coordinates
  view.setFloat64(9, lng, true);
  view.setFloat64(17, lat, true);

  // Convert to hex string
  let hex = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }

  return hex;
}

export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    throw new Error("No autorizado");
  }

  // Verify that the user is updating their own profile
  if (payload.id !== user.id) {
    throw new Error("No tienes permiso para editar este perfil");
  }

  const updates: Partial<PartnerRow> = {};
  if (typeof payload.name === "string") updates.name = payload.name.trim();
  if (typeof payload.isPhysical === "boolean")
    updates.is_physical = payload.isPhysical;
  if (typeof payload.address === "string")
    updates.address = payload.address.trim();
  if (typeof payload.phone === "string") updates.phone = payload.phone.trim();
  if (typeof payload.email === "string")
    updates.billing_email = payload.email.trim();

  const dbType = mapUiCategoryToDb(payload.category);
  if (dbType) updates.partner_type = dbType;

  if (payload.hours) updates.business_hours = payload.hours as unknown as Json;

  if (payload.lat && payload.lng) {
    updates.coordinates = createWKBPoint(
      payload.lat,
      payload.lng,
    ) as unknown as Json;
  }

  if (payload.image_url !== undefined) updates.image_url = payload.image_url;
  if (payload.cover_image_url !== undefined)
    updates.cover_image_url = payload.cover_image_url;
  if (payload.bank_document_url !== undefined)
    updates.bank_document_url = payload.bank_document_url;
  if (payload.estimated_time !== undefined)
    updates.estimated_time = payload.estimated_time;

  if (Object.keys(updates).length === 0) return { ok: true };

  const { error } = await supabase
    .from("partners")
    .update(updates)
    .eq("id", payload.id)
    .select("id")
    .single();

  if (error) {
    console.error("updateMyProfile error", error);
    throw new Error("No se pudo actualizar el perfil");
  }

  return { ok: true };
}
