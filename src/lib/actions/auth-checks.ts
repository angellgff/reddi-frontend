"use server";

import { createClient } from "@supabase/supabase-js";

// Inicializar cliente Admin (Lazy init)
function getSupabaseAdmin() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    // Si faltan keys, lanzamos error aquí (dentro de la función llamada) en vez de al importar el módulo.
    throw new Error("Missing Supabase Admin keys");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

// 1. CHEQUEO DE EMAIL: Busca en auth.users usando RPC
export async function checkEmailRegistered(email: string) {
  try {
    console.log("[AuthCheck] Checking email in auth.users via RPC:", email);

    // Llamamos a la función SQL que creamos en el Paso 1
    const { data, error } = await getSupabaseAdmin().rpc("check_email_exists", {
      email_input: email,
    });

    if (error) {
      console.error("[AuthCheck] RPC Error checking email:", error);
      return false; // Asumimos false si falla para no bloquear, o maneja el error
    }

    console.log("[AuthCheck] Email exists result:", data);
    return data; // Devuelve true/false
  } catch (error) {
    console.error("[AuthCheck] Critical error checking email:", error);
    return false;
  }
}

// 2. CHEQUEO DE TELÉFONO: Busca en public.profiles usando consulta normal
export async function checkPhoneRegistered(phone: string) {
  try {
    console.log("[AuthCheck] Checking phone in public.profiles:", phone);

    // Consulta normal a la tabla 'profiles'.
    // Asegúrate de que la tabla se llame 'profiles' y la columna 'phone'
    const { data, error } = await getSupabaseAdmin()
      .from("profiles")
      .select("id")
      .eq("phone_number", phone) // Cambia 'phone' si tu columna se llama 'celular' o similar
      .maybeSingle();

    console.log("[AuthCheck] Phone check result:", { found: !!data, error });

    if (error) {
      // Ignoramos el error "PGRST116" (JSON null) si ocurre, pero maybeSingle lo maneja bien
      console.error("[AuthCheck] Query error checking phone:", error);
    }

    return !!data; // True si encontró un perfil
  } catch (error) {
    console.error("[AuthCheck] Critical error checking phone:", error);
    return false;
  }
}

// 3. REGISTRO: Actualiza auth.users
export async function registerPhoneForUser(userId: string, phone: string) {
  if (!userId) {
    console.error("Error: userId es null/undefined en registerPhoneForUser");
    return { success: false, error: "User ID missing" };
  }

  try {
    // Actualizamos el usuario en Auth para permitir login futuro por SMS si lo usas
    const { error } = await getSupabaseAdmin().auth.admin.updateUserById(
      userId,
      {
        phone: phone,
        user_metadata: { phone: phone }, // Guardamos en metadata por si acaso
      },
    );

    if (error) throw error;

    // NOTA: Si necesitas que el teléfono también se guarde en 'profiles',
    // asegúrate de tener un Trigger en Supabase o haz un update manual aquí:
    /*
    await supabaseAdmin.from('profiles').update({ phone: phone }).eq('id', userId);
    */

    return { success: true };
  } catch (error) {
    console.error("Error registering phone:", error);
    return { success: false, error };
  }
}
