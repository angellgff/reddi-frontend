"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import type { Tables, TablesUpdate } from "@/src/lib/database.types";

export type UserProfile = Pick<
  Tables<"profiles">,
  | "id"
  | "email"
  | "first_name"
  | "last_name"
  | "phone_number"
  | "role"
  | "selected_address"
>;

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { success: true, user: null as UserProfile | null } as const;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, phone_number, role, selected_address"
    )
    .eq("id", user.id)
    .single();
  if (error) {
    console.warn("getUserProfile error", error);
    return { success: true, user: null as UserProfile | null } as const;
  }
  return { success: true, user: data as UserProfile } as const;
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" } as const;

  const first_name = String(formData.get("first_name") ?? "").trim() || null;
  const last_name = String(formData.get("last_name") ?? "").trim() || null;
  const phone_number =
    String(formData.get("phone_number") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;

  const payload: TablesUpdate<"profiles"> = {
    first_name,
    last_name,
    phone_number,
    email,
  } as any;

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);
  if (error) {
    console.error("updateUserProfile error", error);
    return { success: false, error: "No se pudo actualizar" } as const;
  }
  revalidatePath("/user/profile");
  return { success: true } as const;
}
