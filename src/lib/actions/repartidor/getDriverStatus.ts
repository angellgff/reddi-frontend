"use server";

import { createClient } from "@/src/lib/supabase/server";

export async function getDriverStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "offline" };
  }

  const { data, error } = await supabase
    .from("drivers")
    .select("status")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    // If no driver record found or error, default to offline
    return { status: "offline" };
  }

  return { status: data.status };
}
