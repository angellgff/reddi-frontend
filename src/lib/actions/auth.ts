"use server";

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Resolve role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role;
  }

  let redirectUrl = "/user/home";
  if (next && next !== "null" && next !== "undefined") {
    redirectUrl = next;
  } else {
    switch ((role || "").toLowerCase()) {
      case "admin":
        redirectUrl = "/admin/dashboard";
        break;
      case "market":
        redirectUrl = "/partner/market/dashboard";
        break;
      case "restaurant":
        redirectUrl = "/partner/restaurant/dashboard";
        break;
      case "delivery":
        redirectUrl = "/repartidor/home";
        break;
      default:
        redirectUrl = "/user/home";
    }
  }

  redirect(redirectUrl);
}

export async function loginWithGoogleAction(nextPath: string = "/user/home") {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
