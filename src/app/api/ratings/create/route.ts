// src/app/api/ratings/create/route.ts
// API route to create a rating (reseña de calificación) for a delivered order.
// Uses the server Supabase client (`src/lib/supabase/server`).

import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

interface CreateRatingBody {
  orderId?: string;
  partnerId?: string;
  ratingValue?: number; // 1-5
  comment?: string;
}

export async function POST(req: Request) {
  let body: CreateRatingBody;
  try {
    body = (await req.json()) as CreateRatingBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { orderId, partnerId, ratingValue, comment } = body;
  if (!orderId || !partnerId || typeof ratingValue !== "number") {
    return NextResponse.json(
      { error: "Faltan campos requeridos: orderId, partnerId, ratingValue" },
      { status: 400 }
    );
  }
  if (ratingValue < 1 || ratingValue > 5) {
    return NextResponse.json(
      { error: "ratingValue debe estar entre 1 y 5" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Verify order exists, belongs to this user (if schema has user_id) and is delivered.
  // We attempt to select status, partner_id, user_id (user_id may not exist -> optional fallback).
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id,status,partner_id,user_id")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !orderRow) {
    return NextResponse.json(
      { error: "Pedido no encontrado" },
      { status: 404 }
    );
  }

  // If orders table has user_id ensure it matches auth user.
  if (orderRow.user_id && orderRow.user_id !== user.id) {
    return NextResponse.json(
      { error: "No puedes calificar pedidos de otro usuario" },
      { status: 403 }
    );
  }

  if (orderRow.status !== "delivered") {
    return NextResponse.json(
      { error: "Solo se puede calificar un pedido entregado" },
      { status: 409 }
    );
  }

  if (orderRow.partner_id !== partnerId) {
    return NextResponse.json(
      { error: "partnerId no coincide con el pedido" },
      { status: 400 }
    );
  }

  // Prevent duplicate rating per (order_id, user_id)
  const { data: existing, error: existingErr } = await supabase
    .from("ratings")
    .select("id")
    .eq("order_id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existingErr && existing) {
    return NextResponse.json(
      { error: "Ya existe una calificación para este pedido" },
      { status: 409 }
    );
  }

  // Insert rating
  const { data: inserted, error: insertError } = await supabase
    .from("ratings")
    .insert({
      order_id: orderId,
      partner_id: partnerId,
      user_id: user.id,
      rating_value: ratingValue,
      comment: comment?.trim() || null,
    })
    .select(
      "id, rating_value, comment, order_id, partner_id, user_id, created_at"
    )
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { error: insertError?.message || "Error insertando calificación" },
      { status: 500 }
    );
  }

  // Optional: Recalculate partner metrics (average_rating, total_ratings) best-effort.
  // If fails we ignore silently; partner summary can be updated asynchronously or via DB triggers.
  try {
    const { data: agg, error: aggErr } = await supabase
      .from("ratings")
      .select("rating_value")
      .eq("partner_id", partnerId);
    if (!aggErr && agg) {
      const total = agg.length;
      const avg =
        total === 0
          ? null
          : Number(
              (
                agg.reduce((sum, r) => sum + (r.rating_value || 0), 0) / total
              ).toFixed(2)
            );
      await supabase
        .from("partners")
        .update({ average_rating: avg, total_ratings: total })
        .eq("id", partnerId);
    }
  } catch {
    // noop
  }

  return NextResponse.json({ rating: inserted }, { status: 201 });
}
