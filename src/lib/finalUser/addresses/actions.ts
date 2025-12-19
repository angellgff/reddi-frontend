"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import type { TablesInsert, Enums, Tables } from "@/src/lib/database.types";

type LocationType = Enums<"address_location_type">; // "villa" | "yate"
type UserAddress = Tables<"user_addresses">;

function isLocationType(v: unknown): v is LocationType {
  return (
    v === "villa" ||
    v === "yate" ||
    v === "piscina" ||
    v === "habitacion de hotel" ||
    v === "muelle de yate"
  );
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

export async function createUserAddress(formData: FormData) {
  // Parse & validate inputs defensively
  const locationTypeRaw = formData.get("location_type");
  const locationNumberRaw = formData.get("location_number");
  const latRaw = formData.get("lat");
  const lngRaw = formData.get("lng");

  const location_type = isLocationType(locationTypeRaw)
    ? locationTypeRaw
    : null;
  const location_number = String(locationNumberRaw ?? "").trim();

  if (!location_type) {
    return { success: false, error: "Tipo de lugar inválido." } as const;
  }
  if (!location_number) {
    return {
      success: false,
      error: "Número de villa/yate requerido.",
    } as const;
  }
  // Basic allowlist to prevent strange characters; adjust as needed
  if (!/^[\w\-\s#]{1,32}$/.test(location_number)) {
    return {
      success: false,
      error: "Número inválido. Usa letras, números, # o guiones (máx. 32).",
    } as const;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "No autenticado." } as const;
  }

  const payload: TablesInsert<"user_addresses"> = {
    user_id: user.id,
    location_type,
    location_number,
  };

  if (latRaw && lngRaw) {
    const lat = parseFloat(String(latRaw));
    const lng = parseFloat(String(lngRaw));
    if (!isNaN(lat) && !isNaN(lng)) {
      payload.coordinates = createWKBPoint(lat, lng);
    }
  }

  const { error } = await supabase.from("user_addresses").insert(payload);
  if (error) {
    console.error("createUserAddress insert error", error);
    return {
      success: false,
      error: "No se pudo guardar la dirección.",
    } as const;
  }

  // Revalidate common pages that could depend on addresses
  revalidatePath("/user/address");
  revalidatePath("/user/payment");

  return { success: true } as const;
}

export async function updateUserAddress(id: string, formData: FormData) {
  const locationTypeRaw = formData.get("location_type");
  const locationNumberRaw = formData.get("location_number");

  const location_type = isLocationType(locationTypeRaw)
    ? locationTypeRaw
    : null;
  const location_number = String(locationNumberRaw ?? "").trim();

  if (!location_type)
    return { success: false, error: "Tipo inválido" } as const;
  if (!location_number)
    return { success: false, error: "Número requerido" } as const;
  if (!/^[\w\-\s#]{1,32}$/.test(location_number))
    return { success: false, error: "Número inválido" } as const;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." } as const;

  const { error } = await supabase
    .from("user_addresses")
    .update({ location_number, location_type })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("updateUserAddress error", error);
    return { success: false, error: "No se pudo actualizar" } as const;
  }
  revalidatePath("/user/address");
  revalidatePath("/user/payment");
  return { success: true } as const;
}

export async function deleteUserAddress(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." } as const;

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("deleteUserAddress error", error);
    return { success: false, error: "No se pudo eliminar" } as const;
  }
  revalidatePath("/user/address");
  revalidatePath("/user/payment");
  return { success: true } as const;
}

export async function setSelectedAddress(addressId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." } as const;

  // Validate ownership
  const { data: owns, error: ownErr } = await supabase
    .from("user_addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();
  if (ownErr || !owns) {
    return { success: false, error: "Dirección no encontrada." } as const;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ selected_address: addressId })
    .eq("id", user.id);
  if (error) {
    console.error("setSelectedAddress error", error);
    return { success: false, error: "No se pudo seleccionar." } as const;
  }
  revalidatePath("/user/address");
  revalidatePath("/user/payment");
  return { success: true } as const;
}

// Server fetch for addresses + selected address (for SSR/hydration)
export async function getUserAddressesAndSelected() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return {
      success: true,
      addresses: [] as UserAddress[],
      selectedAddressId: null,
    };
  }

  const [addrRes, profileRes] = await Promise.all([
    supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("selected_address")
      .eq("id", user.id)
      .single(),
  ]);

  if (addrRes.error) {
    // Log but return empty to avoid SSR crash
    console.warn("getUserAddresses error", addrRes.error);
  }
  if (profileRes.error && profileRes.error.code !== "PGRST116") {
    console.warn("getUserAddresses profile error", profileRes.error);
  }

  const addresses = (addrRes.data as unknown as UserAddress[]) || [];
  const selectedAddressId =
    (profileRes.data as { selected_address: string | null })
      ?.selected_address ??
    (addresses[0]?.id as string | undefined) ??
    null;

  return { success: true, addresses, selectedAddressId };
}
