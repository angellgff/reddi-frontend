"use server";

import { createClient } from "@supabase/supabase-js";

// Initialize admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function checkEmailRegistered(email: string) {
  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
}

export async function checkPhoneRegistered(phone: string) {
  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone_number", phone)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error("Error checking phone:", error);
    return false;
  }
}

export async function registerPhoneForUser(userId: string, phone: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      phone: phone,
    });
    // Optional: Auto-verify phone if you don't use phone auth verification
    // phone_confirm: true
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error registering phone:", error);
    return { success: false };
  }
}
