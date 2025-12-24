// src/app/api/orders/create/route.ts

import { createClient } from "@/src/lib/supabase/server"; // Usaremos el cliente de servidor
import { NextResponse } from "next/server";
import { sendOrderCreatedEmail } from "@/src/lib/notifications/email";

export async function POST(request: Request) {
  // Crea un cliente de Supabase específico para esta petición, autenticado como el usuario
  const supabase = await createClient();

  // 1. Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Autenticación requerida." },
      { status: 401 }
    );
  }

  // 2. Obtener los datos del cuerpo de la petición
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la petición no es un JSON válido." },
      { status: 400 }
    );
  }

  const { cart_items, checkout_data } = body;

  // 3. Validación básica de los datos recibidos (puedes expandir esto con Zod)
  if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
    return NextResponse.json(
      { error: "El carrito está vacío o tiene un formato incorrecto." },
      { status: 400 }
    );
  }
  if (!checkout_data) {
    return NextResponse.json(
      { error: "Faltan los datos del checkout." },
      { status: 400 }
    );
  }

    // 4. Llamar a la función RPC de Supabase desde el servidor
    try {
      // Ajuste para pagos manuales: intentar enviar status 'pending' en el payload
      // y asegurarnos de que el método de pago sea correcto.
      const isManual =
        checkout_data.payment?.provider === "manual" ||
        ["cash", "physical_pos"].includes(checkout_data.payment?.method);

      if (isManual) {
        // Intentamos pasar status por si el RPC lo lee del checkout_data
        (checkout_data as any).status = "pending";
      }

      const { data, error } = await supabase.rpc("create_order", {
        cart_items: cart_items,
        checkout_data: checkout_data,
      });

      if (error) {
        console.error("Supabase RPC error:", error);
        return NextResponse.json(
          {
            error:
              error.message || "Error al crear el pedido en la base de datos.",
          },
          { status: 500 }
        );
      }

    // 5. Devolver una respuesta exitosa con el ID del pedido
    const orderId = data as string;

    // --- REGLA CRÍTICA: STATUS PENDING PARA MANUAL ---
    // Si el RPC puso 'awaiting_payment' por defecto, lo forzamos a 'pending' ahora mismo.
    if (isManual && orderId) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "pending" })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating manual order status:", updateError);
        // No fallamos el request principal, pero logueamos el error grave.
      } else {
        console.info(
          `[/api/orders/create] Orden manual ${orderId} status actualizado a Pending`
        );
      }
    }

    console.info("[/api/orders/create] Pedido creado por RPC", {
      orderId,
      hasUser: Boolean(user?.id),
      itemsCount: Array.isArray(cart_items) ? cart_items.length : 0,
      isManual,
    });

    // Email notification (non-blocking best-effort)
    (async () => {
      try {
        // Intentar obtener correo del usuario (ya lo tenemos en user.email)
        const userEmail = user.email || null;
        console.info("[/api/orders/create] Preparando email de confirmación", {
          orderId,
          userEmail,
        });
        if (userEmail && orderId) {
          // Construir resumen simple de ítems
          const itemsSummary = Array.isArray(cart_items)
            ? cart_items
                .slice(0, 5)
                .map(
                  (c: { quantity?: number; productId?: string }) =>
                    `${c.quantity ?? 1}x ${c.productId ?? "Producto"}`
                )
                .join(", ")
            : "";
          // Leer total desde la orden creada (best-effort)
          let totalFormatted = "$0.00";
          try {
            const { data: ord } = await supabase
              .from("orders")
              .select("total_amount")
              .eq("id", orderId)
              .maybeSingle();
            const total = Number(
              (ord as { total_amount?: number } | null)?.total_amount || 0
            );
            totalFormatted = new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "USD",
            }).format(total);
            console.info("[/api/orders/create] Total formateado", {
              orderId,
              total,
              totalFormatted,
            });
          } catch {
            // ignore
          }
          const emailResult = await sendOrderCreatedEmail({
            orderId,
            userEmail,
            totalFormatted,
            itemsSummary,
          });
          console.info("[/api/orders/create] Resultado de envío email", {
            orderId,
            result: emailResult,
          });
        } else {
          console.warn(
            "[/api/orders/create] Email NO enviado: falta userEmail u orderId",
            { orderId, userEmail }
          );
        }
      } catch (e) {
        console.warn("[orders/create] Error enviando email de creación", e);
      }
    })();

    return NextResponse.json({ orderId }, { status: 201 }); // 201 Created
  } catch (err) {
    console.error("API Route /api/orders/create error:", err);
    // Este es un error inesperado en el código de la API Route
    return NextResponse.json(
      { error: "Un error inesperado ocurrió en el servidor." },
      { status: 500 }
    );
  }
}
