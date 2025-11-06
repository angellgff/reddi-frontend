// src/app/api/orders/update-status/route.ts
// Updates the status of an order. Validates partner ownership and allowed status values.

import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { sendOrderStatusChangedEmail } from "@/src/lib/notifications/email";

const VALID_STATUSES = [
  "pending",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

interface Body {
  orderId?: string;
  newStatus?: OrderStatus | string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { orderId, newStatus } = body;
  if (!orderId || !newStatus) {
    return NextResponse.json(
      { error: "orderId y newStatus son requeridos" },
      { status: 400 }
    );
  }
  if (!VALID_STATUSES.includes(newStatus as OrderStatus)) {
    return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Fetch partner for this user
  const { data: partnerRow } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!partnerRow) {
    return NextResponse.json(
      { error: "Usuario no es un partner" },
      { status: 403 }
    );
  }

  // Fetch order to verify ownership
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .select("id, status, partner_id, user_id")
    .eq("id", orderId)
    .maybeSingle();
  if (orderErr || !orderRow) {
    return NextResponse.json(
      { error: "Pedido no encontrado" },
      { status: 404 }
    );
  }
  if (orderRow.partner_id !== partnerRow.id) {
    return NextResponse.json(
      { error: "No puedes modificar pedidos de otro partner" },
      { status: 403 }
    );
  }

  // Simple transition rule example: once cancelled or delivered, can't change (optional)
  if (["cancelled", "delivered"].includes(orderRow.status)) {
    return NextResponse.json(
      { error: "No se puede cambiar un pedido ya finalizado" },
      { status: 409 }
    );
  }

  const previousStatus = orderRow.status as OrderStatus;
  console.info("[/api/orders/update-status] Intento de actualización", {
    orderId,
    partnerId: partnerRow.id,
    previousStatus,
    newStatus,
  });

  const { data: updated, error: updateErr } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .select("id, status")
    .maybeSingle();
  if (updateErr || !updated) {
    return NextResponse.json(
      { error: updateErr?.message || "Error actualizando estado" },
      { status: 500 }
    );
  }
  console.info("[/api/orders/update-status] Estado actualizado", {
    orderId,
    status: updated.status,
  });

  // Enviar correo (no bloqueante)
  (async () => {
    try {
      // Recuperar email del perfil del usuario dueño del pedido
      const userId = (orderRow as { user_id?: string | null })?.user_id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", userId)
          .maybeSingle();
        const userEmail = (profile as { email?: string | null } | null)?.email;
        if (userEmail) {
          console.info(
            "[/api/orders/update-status] Enviando email de cambio de estado",
            {
              orderId,
              to: userEmail,
              previousStatus,
              newStatus,
            }
          );
          const result = await sendOrderStatusChangedEmail({
            orderId,
            userEmail,
            oldStatus: previousStatus,
            newStatus: newStatus as string,
          });
          console.info("[/api/orders/update-status] Resultado envío email", {
            orderId,
            result,
          });
        } else {
          console.warn(
            "[/api/orders/update-status] No se encontró email del usuario",
            { orderId, userId }
          );
        }
      }
    } catch (e) {
      console.warn(
        "[orders/update-status] Error enviando email de cambio de estado",
        e
      );
    }
  })();

  return NextResponse.json({ order: updated }, { status: 200 });
}
