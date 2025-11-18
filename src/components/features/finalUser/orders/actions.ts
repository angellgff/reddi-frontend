"use server";

import { createClient } from "@/src/lib/supabase/server";

interface CheckExistingParams {
  orderId: string;
  userId: string;
}

export async function checkExistingRating({
  orderId,
  userId,
}: CheckExistingParams): Promise<boolean> {
  console.log(
    `[checkExistingRating] - Iniciando chequeo para orderId: ${orderId} y userId: ${userId}`
  );

  if (!orderId || !userId) {
    console.warn("[checkExistingRating] - Faltan orderId o userId.");
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ratings")
    .select("id")
    .eq("order_id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      `[checkExistingRating] - Error de Supabase al verificar la calificación para orderId: ${orderId}`,
      error
    );
    // En caso de error, asumimos que existe para evitar spam de la ventana de calificación.
    return true;
  }

  const ratingExists = !!data;
  console.log(
    `[checkExistingRating] - ¿La calificación para orderId ${orderId} existe?: ${ratingExists}`
  );
  return ratingExists;
}

interface CreateRatingParams {
  orderId: string;
  partnerId: string;
  userId: string;
  ratingValue: number;
  comment?: string;
}

export async function createRatingAction(
  params: CreateRatingParams
): Promise<{ success: boolean; error?: string }> {
  const { orderId, partnerId, userId, ratingValue, comment } = params;

  console.log(
    `[createRatingAction] - Intento de crear calificación para orderId: ${orderId}`,
    { partnerId, userId, ratingValue }
  );

  if (!orderId || !partnerId || !userId) {
    console.warn(
      `[createRatingAction] - Datos incompletos para orderId: ${orderId}. Faltan datos esenciales.`
    );
    return {
      success: false,
      error: "Faltan datos para registrar la calificación.",
    };
  }

  if (typeof ratingValue !== "number" || ratingValue < 1 || ratingValue > 5) {
    console.warn(
      `[createRatingAction] - Valor de calificación inválido para orderId: ${orderId}`,
      { ratingValue }
    );
    return { success: false, error: "Valor de calificación inválido." };
  }

  const supabase = await createClient();

  // Prevenir inserción de duplicados
  console.log(
    `[createRatingAction] - Verificando si ya existe una calificación para orderId: ${orderId}`
  );
  const { data: existing, error: checkError } = await supabase
    .from("ratings")
    .select("id")
    .eq("order_id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (checkError) {
    console.error(
      `[createRatingAction] - Error de Supabase al verificar calificación existente para orderId: ${orderId}`,
      checkError
    );
    return {
      success: false,
      error: checkError.message || "Error al verificar calificación existente",
    };
  }

  if (existing) {
    console.log(
      `[createRatingAction] - La calificación para orderId: ${orderId} ya existe. Omitiendo creación.`
    );
    return { success: true }; // Ya fue calificado, se considera un éxito.
  }

  // Insertar la nueva calificación
  console.log(
    `[createRatingAction] - Insertando nueva calificación para orderId: ${orderId}`
  );
  const { error: insertError } = await supabase.from("ratings").insert({
    order_id: orderId,
    partner_id: partnerId,
    user_id: userId,
    rating: ratingValue,
    comment: comment || null,
  });

  if (insertError) {
    console.error(
      `[createRatingAction] - Error de Supabase al insertar la calificación para orderId: ${orderId}`,
      insertError
    );
    return {
      success: false,
      error: insertError.message || "Error guardando calificación",
    };
  }

  console.log(
    `[createRatingAction] - Calificación creada exitosamente para orderId: ${orderId}`
  );
  return { success: true };
}

// --- Order live status: driver lookup ---
export interface AssignedDriverResult {
  assigned: boolean;
  user?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
  };
}

export async function getAssignedDriverForOrder(
  orderId: string
): Promise<AssignedDriverResult> {
  console.log(`[getAssignedDriverForOrder] - orderId: ${orderId}`);
  if (!orderId) return { assigned: false };

  const supabase = await createClient();
  const { data: ship, error } = await supabase
    .from("shipments")
    .select(
      `id, order_id, driver_id,
       driver:drivers!shipments_driver_id_fkey(
         id,
         user:profiles!drivers_user_id_fkey(
           id, first_name, last_name, email, phone_number
         )
       )`
    )
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("[getAssignedDriverForOrder] - Supabase error", error);
    return { assigned: false };
  }

  const user = (ship as any)?.driver?.user;
  if (!ship || !user) return { assigned: false };

  return {
    assigned: true,
    user: {
      id: user?.id ?? undefined,
      first_name: user?.first_name ?? null,
      last_name: user?.last_name ?? null,
      email: user?.email ?? null,
      phone_number: user?.phone_number ?? null,
    },
  };
}
