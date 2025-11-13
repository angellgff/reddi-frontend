"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import type { Tables, TablesInsert } from "@/src/lib/database.types";

export type UserPaymentMethod = Tables<"user_payment_methods">;

function detectBrandFromNumber(num: string): string {
  const n = num.replace(/\s|-/g, "");
  if (/^4[0-9]{6,}$/.test(n)) return "visa";
  if (/^5[1-5][0-9]{5,}$/.test(n)) return "mastercard";
  if (/^3[47][0-9]{5,}$/.test(n)) return "amex";
  if (/^6(?:011|5[0-9]{2})[0-9]{3,}$/.test(n)) return "discover";
  return "card";
}

function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i]!, 10);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export async function addUserPaymentMethod(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" } as const;

  // Extract fields
  const cardholder_name =
    String(formData.get("cardholder_name") || "").trim() || null;
  const card_number = String(formData.get("card_number") || "").replace(
    /\s|-/g,
    ""
  );
  const cvv = String(formData.get("cvv") || "").trim();
  const exp_raw = String(formData.get("exp") || "").trim(); // mm/yyyy or mm/yy
  const postal_code = String(formData.get("postal_code") || "").trim() || null;
  const brandField = String(formData.get("brand") || "").trim();

  if (!card_number || card_number.length < 12)
    return { success: false, error: "Número de tarjeta inválido" } as const;
  if (!luhnValid(card_number))
    return {
      success: false,
      error: "Número de tarjeta no pasa validación",
    } as const;
  if (!exp_raw || !/^(0?[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(exp_raw))
    return { success: false, error: "Fecha de vencimiento inválida" } as const;
  if (!cvv || cvv.length < 3)
    return { success: false, error: "CVV inválido" } as const;

  const [, mmStr, yyStr] = exp_raw.match(/(\d{1,2})\/(\d{2,4})/)!;
  const exp_month = parseInt(mmStr, 10);
  const exp_year = parseInt(yyStr.length === 2 ? `20${yyStr}` : yyStr, 10);
  const last4 = card_number.slice(-4);
  const brand = brandField || detectBrandFromNumber(card_number);

  // Store full form payload temporarily in provider token field (for dev only)
  const payment_provider_token = JSON.stringify({
    card_number,
    cvv,
    exp: exp_raw,
    postal_code,
    cardholder_name,
    brand,
    meta: { stored_at: new Date().toISOString(), env: "dev_local" },
  });

  const payload: TablesInsert<"user_payment_methods"> = {
    user_id: user.id,
    brand,
    cardholder_name,
    exp_month,
    exp_year,
    is_default: false,
    last4,
    postal_code,
    payment_provider_token,
  } as any;

  const { error } = await supabase.from("user_payment_methods").insert(payload);
  if (error) {
    console.error("addUserPaymentMethod error", error);
    return { success: false, error: "No se pudo guardar el método" } as const;
  }
  revalidatePath("/user/payment");
  return { success: true } as const;
}

export async function deleteUserPaymentMethod(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" } as const;

  const { error } = await supabase
    .from("user_payment_methods")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    console.error("deleteUserPaymentMethod error", error);
    return { success: false, error: "No se pudo eliminar" } as const;
  }
  revalidatePath("/user/payment");
  return { success: true } as const;
}

export async function setDefaultPaymentMethod(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" } as const;

  // Simple: set selected one to default and others to false
  const { error: e1 } = await supabase
    .from("user_payment_methods")
    .update({ is_default: false })
    .eq("user_id", user.id);
  if (e1) {
    console.error("setDefaultPaymentMethod reset error", e1);
  }
  const { error: e2 } = await supabase
    .from("user_payment_methods")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (e2) {
    console.error("setDefaultPaymentMethod set error", e2);
    return { success: false, error: "No se pudo actualizar" } as const;
  }
  revalidatePath("/user/payment");
  return { success: true } as const;
}

// Fetch the user's default payment method (server-side)
export async function getUserDefaultPaymentMethod() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: true, method: null as UserPaymentMethod | null };

  const { data, error } = await supabase
    .from("user_payment_methods")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("getUserDefaultPaymentMethod error", error);
  }
  return {
    success: true,
    method: (data as UserPaymentMethod) || null,
  } as const;
}
