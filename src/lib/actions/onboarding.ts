"use server";

import { createClient } from "@/src/lib/supabase/server";
import { cookies } from "next/headers";

export async function completeOnboarding() {
  const cookieStore = await cookies();
  cookieStore.set("onboarding_seen", "true", {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });
  }

  return { success: true };
}
