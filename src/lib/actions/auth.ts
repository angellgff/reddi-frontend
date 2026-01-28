"use server";

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  checkEmailRegistered,
  checkPhoneRegistered,
  registerPhoneForUser,
} from "./auth-checks";

export async function signUpAction(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const { email, password, firstName, lastName, phone } = data;
  const origin = (await headers()).get("origin");

  // 1. Validaciones previas (Reutilizando lógica existente)
  const [emailExists, phoneExists] = await Promise.all([
    checkEmailRegistered(email),
    checkPhoneRegistered(phone),
  ]);

  const errors: Record<string, string> = {};
  if (emailExists)
    errors.email = "Este email esta registrado con una cuenta existente";
  if (phoneExists)
    errors.phone = "Este número está vinculado a una cuenta existente";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const supabase = await createClient();

  // 2. Sign Up
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        full_name: `${firstName} ${lastName}`.trim(),
      },
    },
  });

  if (error) {
    console.error("Supabase SignUp Error:", error);
    if (
      error.code === "user_already_exists" ||
      error.message?.includes("already registered") ||
      error.message?.includes("User already exists")
    ) {
      return {
        success: false,
        errors: {
          email: "Este email esta registrado con una cuenta existente",
        },
      };
    }
    return { success: false, errors: { general: error.message } };
  }

  // 3. Register Phone (Admin action)
  if (signUpData.user?.id) {
    const phoneResult = await registerPhoneForUser(signUpData.user.id, phone);
    if (!phoneResult.success) {
      console.error("Error registering phone:", phoneResult.error);
      // No bloqueamos el registro si falla esto, pero lo logueamos
    }
  }

  return { success: true };
}

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string;

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reddi-app.com";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(
        nextPath,
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

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
