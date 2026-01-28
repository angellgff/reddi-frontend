import { createClient } from "@/src/lib/supabase/server";
import { type Provider } from "@supabase/supabase-js";

// --- 1. Utilities ---

export const isEmail = (input: string): boolean => {
  // Simple check: looking for @ and domain part
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

export const formatPhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Logic for E.164
  // Assuming Dominican Republic / North America (+1) based on context
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // If user included country code (e.g. 1809...)
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }

  // If it's something else, return with + assuming it's international format without +
  if (phone.startsWith("+")) return phone;

  return `+${cleaned}`;
};

// --- Type Definitions ---

export type RegisterUserData = {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
};

type AuthResponse = {
  success: boolean;
  data?: any;
  error?: string;
  needOtp?: boolean; // Signal to UI to show OTP input
};

// --- 2. Register Service ---

export async function registerUser(
  data: RegisterUserData,
): Promise<AuthResponse> {
  const supabase = await createClient();
  const formattedPhone = formatPhone(data.phone);

  // 1. Sign Up with Email & Password
  // We pass metadata here as requested
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: formattedPhone, // Stored in metadata initially
        full_name: `${data.firstName} ${data.lastName}`.trim(),
      },
    },
  });

  if (signUpError) {
    return { success: false, error: signUpError.message };
  }

  if (!signUpData.user) {
    return { success: false, error: "No user returned from sign up." };
  }

  // 2. Trigger Phone Verification (Update User)
  // CRITICAL: This requires an active session.
  // signUp returns a session if email confirmation is disabled or implicit.
  // If email needs confirmation, session is null, and we CANNOT trigger SMS update yet.

  if (signUpData.session) {
    console.log(
      `[AuthService] SignUp success. Session active. Updating user phone to: ${formattedPhone}`,
    );
    const { error: updateError, data: updateData } =
      await supabase.auth.updateUser({
        phone: formattedPhone,
      });

    if (updateError) {
      // If update fails, user is still created but phone isn't set as auth factor yet.
      // We return success but log error? Or treat as partial success?
      console.error("[AuthService] Error updating phone:", updateError);
      // We can fallback to asking user to verify phone later
    } else {
      console.log(
        "[AuthService] Phone update triggered. OTP should be sent.",
        updateData,
      );
      // Successful update triggers SMS (if configured in Supabase)
      return { success: true, data: signUpData, needOtp: true };
    }
  }

  // If no session, user likely needs to verify email first.
  return { success: true, data: signUpData, needOtp: false };
}

// --- 3. Verify Phone Service ---

export async function verifyUserPhone(
  phone: string,
  token: string,
): Promise<AuthResponse> {
  const supabase = await createClient();
  const formattedPhone = formatPhone(phone);

  // 1. Check if we have an active session (user logged in via createAccount)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log(
    "[AuthService] verifyUserPhone -> Session exists?",
    !!session?.user?.id,
  );

  let verifyError;
  let verifyData;

  try {
    if (session) {
      // SCENARIO A: Authenticated user (just registered).
      // To link the phone to this user, Supabase requires type="phone_change".
      // It validates the code sent by updateUser({ phone }).
      console.log(
        `[AuthService] verifying as 'phone_change' for user ${session.user.id}`,
      );
      const res = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: "phone_change",
      });
      verifyData = res.data;
      verifyError = res.error;
    } else {
      // SCENARIO B: Unknown/Unauthenticated user.
      // Standard login via OTP (signInWithOtp).
      // Supabase requires type="sms".
      console.log("[AuthService] verifying as 'sms' (login)");
      const res = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: "sms",
      });
      verifyData = res.data;
      verifyError = res.error;
    }

    if (verifyError) {
      // Special handling for the "different user" error
      if (
        verifyError.message &&
        verifyError.message.includes("different user")
      ) {
        console.error(
          "[AuthService] Identity conflict: Phone linked to another account.",
        );
        return {
          success: false,
          error:
            "Este número ya está asociado a otra cuenta. Usa otro número o inicia sesión.",
        };
      }
      throw verifyError;
    }

    // If success, user is now logged in (or phone updated).
    // Double check user roles/metadata if needed.
    const user = verifyData.user;
    return { success: true, user: user || undefined };
  } catch (error: any) {
    console.error("[AuthService] Verify error:", error.message);
    return { success: false, error: error.message };
  }
}

// --- 4. Login Service ---

export async function loginUser(
  identifier: string,
  password?: string,
): Promise<AuthResponse> {
  const supabase = await createClient();

  if (isEmail(identifier)) {
    if (!password)
      return { success: false, error: "Password required for email login" };

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } else {
    // Phone Login Flow
    const formattedPhone = formatPhone(identifier);

    // Step A: Send Code
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) return { success: false, error: error.message };

    // Return needOtp to tell UI to show code input
    return { success: true, needOtp: true };
  }
}
