"use server";

import { createClient } from "@/src/lib/supabase/server";
import type { Database, Json } from "@/src/lib/database.types";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];

export type UpdatePartnerPayload = {
  id: string;
  name?: string;
  isPhysical?: boolean;
  address?: string;
  category?: "market" | "restaurant" | "alcohol";
  phone?: string;
  email?: string;
  hours?: Record<string, { active: boolean; opens: string; closes: string }>;
  profileState?: boolean;
  lat?: number | null;
  lng?: number | null;
  // logo/document uploads are out of scope here; handled by storage flows
};

function mapUiCategoryToDb(
  partnerCategory?: UpdatePartnerPayload["category"]
): PartnerRow["partner_type"] | undefined {
  if (!partnerCategory) return undefined;
  return partnerCategory === "alcohol" ? "liquor_store" : partnerCategory;
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

export async function updatePartnerProfile(payload: UpdatePartnerPayload) {
  const supabase = await createClient();

  // Basic validation
  if (!payload.id) throw new Error("Missing partner id");

  const updates: Partial<PartnerRow> = {};
  if (typeof payload.name === "string") updates.name = payload.name.trim();
  if (typeof payload.isPhysical === "boolean")
    updates.is_physical = payload.isPhysical;
  if (typeof payload.address === "string")
    updates.address = payload.address.trim();
  if (typeof payload.phone === "string") updates.phone = payload.phone.trim();
  if (typeof payload.email === "string")
    updates.billing_email = payload.email.trim();
  if (typeof payload.profileState === "boolean")
    updates.is_approved = payload.profileState;
  const dbType = mapUiCategoryToDb(payload.category);
  if (dbType) updates.partner_type = dbType;
  if (payload.hours) updates.business_hours = payload.hours as unknown as Json; // JSON column
  if (payload.lat && payload.lng) {
    // Convert to WKB hex string
    updates.coordinates = createWKBPoint(payload.lat, payload.lng) as unknown as Json;
  }

  // Approval consistency with check constraint
  if (typeof payload.profileState === "boolean") {
    if (payload.profileState === true) {
      // We must provide approved_at and approved_by
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        console.error("updatePartnerProfile: missing auth user", userErr);
        throw new Error("No autorizado");
      }

      // Look up admin id for this user
      const { data: adminRow, error: adminErr } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (adminErr || !adminRow) {
        console.error(
          "updatePartnerProfile: admin not found for user",
          adminErr
        );
        throw new Error("Administrador no válido");
      }

      updates.approved_at = new Date().toISOString();
      updates.approved_by = adminRow.id;
    } else {
      // Unapproval: ensure fields are null
      updates.approved_at = null;
      updates.approved_by = null;
    }
  }

  // No-op safeguard
  if (Object.keys(updates).length === 0) return { ok: true };

  // Update with RLS in mind: ensure the caller has permission via policies; this uses the cookie session
  const { error } = await supabase
    .from("partners")
    .update(updates)
    .eq("id", payload.id)
    .select("id")
    .single();

  if (error) {
    console.error("updatePartnerProfile error", error);
    throw new Error("No se pudo actualizar el aliado");
  }

  return { ok: true };
}
