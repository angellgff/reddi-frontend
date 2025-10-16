"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import type { TablesInsert, Enums } from "@/src/lib/database.types";

type LocationType = Enums<"address_location_type">; // "villa" | "yate"

function isLocationType(v: unknown): v is LocationType {
  return v === "villa" || v === "yate";
}

export async function createUserAddress(formData: FormData) {
  // Parse & validate inputs defensively
  const locationTypeRaw = formData.get("location_type");
  const locationNumberRaw = formData.get("location_number");

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
    .update({ selected_address: addressId } as any)
    .eq("id", user.id);
  if (error) {
    console.error("setSelectedAddress error", error);
    return { success: false, error: "No se pudo seleccionar." } as const;
  }
  revalidatePath("/user/address");
  revalidatePath("/user/payment");
  return { success: true } as const;
}
