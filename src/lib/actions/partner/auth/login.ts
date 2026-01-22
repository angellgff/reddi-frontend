"use server";

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginPartnerAction(
  prevState: unknown,
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    }
    return { error: error.message };
  }

  if (data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
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

  // Validate Partner Role
  const allowedRoles = ["market", "restaurant"];
  if (!role || !allowedRoles.includes(role.toLowerCase())) {
    await supabase.auth.signOut();
    return {
      error:
        "Este inicio de sesión es exclusivo para partners (comercios y restaurantes).",
    };
  }

  // Determine redirect URL
  let finalRedirect = redirectTo;

  // If no specific redirect or generic partner dashboard, route to specific role dashboard
  if (!finalRedirect || finalRedirect.includes("/partner/dashboard")) {
    if (role === "restaurant") {
      finalRedirect = "/partner/restaurant/dashboard";
    } else {
      finalRedirect = "/partner/market/dashboard";
    }
  }

  redirect(finalRedirect);
}

export async function loginPartnerWithGoogleAction() {
  console.log("[loginPartnerWithGoogleAction] START");
  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const nextPath = "/partner/dashboard"; // Default post-login for partners

  // Set intent cookie
  const cookieStore = await cookies();
  cookieStore.set("auth_intent", "partner", { path: "/", maxAge: 300 }); // 5 mins

  const builtRedirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(
    nextPath,
  )}&intent=partner`;

  console.log(
    "[loginPartnerWithGoogleAction] Built Redirect URL:",
    builtRedirectTo,
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: builtRedirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("[loginPartnerWithGoogleAction] Error:", error.message);
    return { error: error.message };
  }

  if (data.url) {
    console.log(
      "[loginPartnerWithGoogleAction] SUCCESS - Redirecting to Supabase OAuth:",
      data.url,
    );
    redirect(data.url);
  }
}
