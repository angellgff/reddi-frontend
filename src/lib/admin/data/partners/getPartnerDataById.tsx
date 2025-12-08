import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";
import type { BusinessFormData } from "@/src/components/features/admin/partners/editPartner/PartnerProfile";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
type SelectedPartnerColumns = Pick<
  PartnerRow,
  | "id"
  | "name"
  | "is_physical"
  | "address"
  | "partner_type"
  | "phone"
  | "billing_email"
  | "business_hours"
  | "image_url"
  | "cover_image_url"
  | "is_approved"
  | "coordinates"
  | "bank_document_url"
>;

const defaultHours: BusinessFormData["hours"] = {
  monday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  tuesday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  wednesday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  thursday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  friday: { active: false, opens: "08:00:00", closes: "18:00:00" },
  saturday: { active: false, opens: "08:00:00", closes: "18:00:00" },
};

function parseWKBPoint(wkb: string): { lat: number; lng: number } | null {
  try {
    // Remove "0x" if present
    const hex = wkb.startsWith("0x") ? wkb.slice(2) : wkb;

    // Basic validation for WKB Point with SRID (EWKB)
    // 1 byte endian + 4 bytes type + 4 bytes SRID + 16 bytes coords = 25 bytes = 50 hex chars
    if (hex.length < 50) return null;

    // We assume Little Endian (01) as per the example
    // Skip:
    // 1 byte (endianness) -> 2 chars
    // 4 bytes (type) -> 8 chars
    // 4 bytes (SRID) -> 8 chars
    // Total offset = 18 chars

    const xHex = hex.substring(18, 34);
    const yHex = hex.substring(34, 50);

    // Parse doubles from hex
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);

    // Helper to write hex to dataview
    const writeHexToView = (hexStr: string, offset: number) => {
      for (let i = 0; i < 8; i++) {
        const byte = parseInt(hexStr.substring(i * 2, i * 2 + 2), 16);
        view.setUint8(offset + i, byte);
      }
    };

    writeHexToView(xHex, 0);
    writeHexToView(yHex, 8);

    // Read as little endian doubles
    const lng = view.getFloat64(0, true);
    const lat = view.getFloat64(8, true);

    return { lat, lng };
  } catch (e) {
    console.error("Error parsing WKB:", e);
    return null;
  }
}

function mapDbToForm(row: SelectedPartnerColumns): BusinessFormData {
  const hours =
    (row.business_hours as unknown as BusinessFormData["hours"]) ||
    defaultHours;
  const category =
    row.partner_type === "liquor_store"
      ? ("alcohol" as const)
      : (row.partner_type as "restaurant" | "market");

  let lat: number | null = null;
  let lng: number | null = null;

  if (typeof row.coordinates === "string") {
    const parsed = parseWKBPoint(row.coordinates);
    if (parsed) {
      lat = parsed.lat;
      lng = parsed.lng;
    }
  } else if (
    typeof row.coordinates === "object" &&
    row.coordinates !== null &&
    "coordinates" in row.coordinates
  ) {
    // Fallback for GeoJSON if the DB returns it
    const coords = (row.coordinates as { coordinates: [number, number] })
      .coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      lng = coords[0];
      lat = coords[1];
    }
  }

  return {
    name: row.name,
    isPhysical: !!row.is_physical,
    address: row.address || "",
    category,
    phone: row.phone || "",
    email: row.billing_email || "",
    hours,
    profileState: !!row.is_approved,
    logo: row.image_url || null,
    coverImage: row.cover_image_url || null,
    document: row.bank_document_url || null,
    lat,
    lng,
  };
}

export default async function getPartnerDataById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select(
      "id, name, is_physical, address, partner_type, phone, billing_email, business_hours, image_url, cover_image_url, is_approved, coordinates, bank_document_url"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getPartnerDataById error", error);
    throw new Error("Aliado no encontrado");
  }

  return mapDbToForm(data as SelectedPartnerColumns);
}
