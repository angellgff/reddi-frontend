// src/app/api/orders/create/route.ts

import { createClient } from "@/src/lib/supabase/server"; // Usaremos el cliente de servidor
import { NextResponse } from "next/server";

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
  } catch (error) {
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
  // ¡Aquí es donde ocurre la magia! La llamada se hace servidor a servidor.
  try {
    const { data, error } = await supabase.rpc("create_order", {
      // Los nombres de los argumentos deben coincidir exactamente con tu función RPC
      cart_items: cart_items,
      checkout_data: checkout_data,
    });

    if (error) {
      // Si la RPC devuelve un error, lo registramos y lo enviamos al cliente
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
    // La RPC debería devolver el ID de la nueva orden como texto.
    return NextResponse.json({ orderId: data }, { status: 201 }); // 201 Created
  } catch (err) {
    console.error("API Route /api/orders/create error:", err);
    // Este es un error inesperado en el código de la API Route
    return NextResponse.json(
      { error: "Un error inesperado ocurrió en el servidor." },
      { status: 500 }
    );
  }
}
