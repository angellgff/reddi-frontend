"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface UpdateProfileParams {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string; // Email usually handled separately in Supabase Auth, but maybe we can't change it easily here without re-verification. I'll skip email update for now or just allow visual update if the requirement implies it. Usually email update requires confirmation. I will focus on profile fields.
  birthDate?: string;
}

export async function updateRepartidorProfile(params: UpdateProfileParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No authenticated user" };
  }

  // Update public.profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: params.firstName,
      last_name: params.lastName,
      phone_number: params.phone,
      // birth_date: params.birthDate // Not in schema yet
    })
    .eq("id", user.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    return { error: "Error updating profile" };
  }

  // Update user metadata if birthDate is needed there since it's not in table
  if (params.birthDate) {
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        birth_date: params.birthDate,
      },
    });
    if (metaError) {
      console.error("Error updating metadata:", metaError);
      // Non-critical
    }
  }

  revalidatePath("/repartidor/profile/settings");
  revalidatePath("/repartidor/profile"); // For name display on main profile
  return { success: true };
}
