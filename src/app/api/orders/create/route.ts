// src/app/api/orders/create/route.ts

import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendOrderCreatedEmail } from "@/src/lib/notifications/email";

export async function POST(request: Request) {
  console.log("🚀 [API START] Iniciando creación de orden...");

  // Crea un cliente de Supabase específico para esta petición
  const supabase = await createClient();

  // 1. Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("❌ [API ERROR] Usuario no autenticado.");
    return NextResponse.json(
      { error: "Autenticación requerida." },
      { status: 401 },
    );
  }

  // 2. Obtener los datos del cuerpo de la petición
  let body;
  try {
    body = await request.json();
  } catch (e) {
    console.error("❌ [API ERROR] Fallo al parsear JSON del body:", e);
    return NextResponse.json(
      { error: "El cuerpo de la petición no es un JSON válido." },
      { status: 400 },
    );
  }

  const { cart_items, checkout_data } = body;

  // --- 🔍 DEBUG LOGS: INSPECCIÓN DE DATOS ENTRANTES ---
  console.log("📦 [API DEBUG] Datos recibidos:");
  console.log(`   - Usuario ID: ${user.id}`);
  console.log(`   - Items en carrito: ${cart_items?.length || 0}`);

  // INSPECCIÓN PROFUNDA DE ITEMS Y VARIANTES
  if (Array.isArray(cart_items)) {
    cart_items.forEach((item: any, index: number) => {
      console.log(`   🔸 Item #${index} [${item.name || "Sin nombre"}]:`);
      console.log(`      Product ID: ${item.productId}`);
      console.log(`      Quantity: ${item.quantity}`);

      // Verificamos si existe la propiedad variants y qué contiene
      if (item.variants) {
        console.log(
          `      ✅ Propiedad 'variants' encontrada:`,
          JSON.stringify(item.variants),
        );

        // Verificación específica de la estructura del ID
        if (Array.isArray(item.variants) && item.variants.length > 0) {
          const v = item.variants[0];
          console.log(
            `         👉 Variant ID (camelCase 'variantId'): ${v.variantId}`,
          );
          console.log(
            `         👉 Variant ID (snake_case 'variant_id'): ${v.variant_id}`,
          );
          console.log(`         👉 ID genérico ('id'): ${v.id}`);
        } else {
          console.log(`      ⚠️ 'variants' es un array vacío.`);
        }
      } else {
        console.log(
          `      ❌ Propiedad 'variants' NO existe en este item (es undefined o null).`,
        );
      }
    });
  }
  // -----------------------------------------------------

  // 3. Validación básica de los datos recibidos
  if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
    console.error("❌ [API ERROR] Carrito vacío o formato incorrecto.");
    return NextResponse.json(
      { error: "El carrito está vacío o tiene un formato incorrecto." },
      { status: 400 },
    );
  }
  if (!checkout_data) {
    console.error("❌ [API ERROR] Faltan datos de checkout.");
    return NextResponse.json(
      { error: "Faltan los datos del checkout." },
      { status: 400 },
    );
  }

  // 4. Llamar a la función RPC de Supabase desde el servidor
  try {
    // Ajuste para pagos manuales: intentar enviar status 'pending' en el payload
    const isManual =
      checkout_data.payment?.provider === "manual" ||
      ["cash", "physical_pos"].includes(checkout_data.payment?.method);

    if (isManual) {
      // Intentamos pasar status por si el RPC lo lee del checkout_data
      (checkout_data as any).status = "pending";
    }

    console.log(
      "🔄 [API DEBUG] Llamando a RPC 'create_order_with_variants_v2'...",
    );

    // IMPORTANTE: Asegúrate que el nombre de la función coincida con tu SQL.
    // Usamos 'create_order' que es el nombre estándar del script SQL proporcionado.
    const { data, error } = await supabase.rpc(
      "create_order_with_variants_v2",
      {
        cart_items: cart_items,
        checkout_data: checkout_data,
      },
    );

    if (error) {
      console.error("❌ [API ERROR] Supabase RPC falló:", error);
      console.error("   Mensaje:", error.message);
      console.error("   Detalles:", error.details);
      console.error("   Hint:", error.hint);
      return NextResponse.json(
        {
          error:
            error.message || "Error al crear el pedido en la base de datos.",
        },
        { status: 500 },
      );
    }

    // 5. Devolver una respuesta exitosa con el ID del pedido
    const orderId = data as string;
    console.log(`✅ [API SUCCESS] Orden creada exitosamente. ID: ${orderId}`);

    // --- REGLA CRÍTICA: STATUS PENDING PARA MANUAL ---
    if (isManual && orderId) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "pending" })
        .eq("id", orderId);

      if (updateError) {
        console.error(
          "⚠️ [API WARN] Error actualizando status manual:",
          updateError,
        );
      } else {
        console.log(
          "ℹ️ [API INFO] Status actualizado a 'pending' (Pago Manual).",
        );
      }
    }

    console.info("[/api/orders/create] Resumen:", {
      orderId,
      hasUser: Boolean(user?.id),
      itemsCount: Array.isArray(cart_items) ? cart_items.length : 0,
      isManual,
    });

    // Email notification (non-blocking best-effort)
    (async () => {
      try {
        // Intentar obtener correo del usuario
        const userEmail = user.email || null;
        console.info("[/api/orders/create] Preparando email...", {
          orderId,
          userEmail,
        });

        if (userEmail && orderId) {
          // Construir resumen simple de ítems
          const itemsSummary = Array.isArray(cart_items)
            ? cart_items
                .slice(0, 5)
                .map(
                  (c: {
                    quantity?: number;
                    productId?: string;
                    name?: string;
                  }) =>
                    `${c.quantity ?? 1}x ${c.name || c.productId || "Producto"}`,
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
              (ord as { total_amount?: number } | null)?.total_amount || 0,
            );
            totalFormatted = new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "USD",
            }).format(total);
            console.info(
              "[/api/orders/create] Total recuperado para email:",
              totalFormatted,
            );
          } catch (e) {
            console.warn("⚠️ Error leyendo total para email", e);
          }

          const emailResult = await sendOrderCreatedEmail({
            orderId,
            userEmail,
            totalFormatted,
            itemsSummary,
          });
          console.info(
            "[/api/orders/create] Resultado de envío email:",
            emailResult,
          );
        } else {
          console.warn(
            "[/api/orders/create] Email NO enviado: falta userEmail u orderId",
          );
        }
      } catch (e) {
        console.warn("[orders/create] Error enviando email de creación", e);
      }
    })();

    return NextResponse.json({ orderId }, { status: 201 }); // 201 Created
  } catch (err) {
    console.error("🔥 [API CRITICAL ERROR] Excepción no controlada:", err);
    return NextResponse.json(
      { error: "Un error inesperado ocurrió en el servidor." },
      { status: 500 },
    );
  }
}
