"use server";

import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkEmailRegistered, checkPhoneRegistered } from "./auth-checks";
import {
  registerUser,
  loginUser,
  verifyUserPhone,
} from "@/src/lib/services/authService";

export async function signUpAction(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}) {
  const { email, password, firstName, lastName, phone } = data;

  console.log(`[Action] signUpAction phone: ${phone}`);

  // // 1. Validaciones previas (Reutilizando lógica existente)
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

  // 2. Use Service for Registration
  const result = await registerUser({
    email,
    password,
    firstName,
    lastName,
    phone,
  });

  if (!result.success) {
    if (
      result.error?.includes("already registered") ||
      result.error?.includes("User already exists")
    ) {
      return {
        success: false,
        errors: {
          email: "Este email esta registrado con una cuenta existente",
        },
      };
    }
    return {
      success: false,
      errors: { general: result.error || "Error desconocido" },
    };
  }

  // 3. Return success and OTP requirement
  return { success: true, needOtp: result.needOtp };
}

export async function verifyOtpAction(phoneInput: string, token: string) {
  // Ensure we verify against the same hardcoded number if strict testing is active
  const phone = phoneInput;
  console.log(`[Action] verifyOtpAction processing for ${phone}`);

  const result = await verifyUserPhone(phone, token);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true };
}

export async function resendOtpAction(phoneInput: string) {
  const phone = phoneInput;
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log(`[Action] resendOtpAction for ${phone}. Session: ${!!session}`);

  let error;
  try {
    if (session) {
      // Authenticated flow: resend phone_change OTP
      // STRATEGY CHANGE: Instead of auth.resend(type: 'phone_change'), we call updateUser again.
      // This is more robust for "linking" scenarios as it forces a new verification challenge.
      console.log(
        "[Action] Triggering updateUser again to resend OTP to:",
        phone,
      );
      const res = await supabase.auth.updateUser({
        phone: phone,
      });
      console.log("[Action] updateUser (resend override) result:", res);
      error = res.error;
    } else {
      // Unauthenticated flow: resend SMS OTP (login)
      console.log("[Action] Resending 'sms' OTP (login) to:", phone);
      const res = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      console.log("[Action] Resend 'sms' result:", res);
      error = res.error;
    }

    if (error) {
      console.error("[Action] Resend error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function loginAction(prevState: unknown, formData: FormData) {
  const identifier = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string;

  console.log("[Action] loginAction triggered", { identifier });

  const result = await loginUser(identifier, password);
  console.log("[Action] loginUser result:", result);

  if (!result.success) {
    if (result.error?.includes("Email not confirmed")) {
      redirect(`/auth/verify-email?email=${encodeURIComponent(identifier)}`);
    }
    return { error: result.error };
  }

  if (result.needOtp) {
    console.log("[Action] Returning needOtp state to UI");
    // Return state to UI to switch to OTP input
    // The UI must handle this state (prevState.needOtp)
    return { needOtp: true, phone: identifier };
  }

  // Session established. Now determine redirect based on Role.
  const supabase = await createClient();

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
