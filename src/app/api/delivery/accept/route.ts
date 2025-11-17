import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  console.log("--- Inicia la solicitud a /api/delivery/accept ---");
  try {
    const body = await req.json().catch((err) => {
      console.error("Error al parsear el JSON del body:", err);
      return { error: "Invalid JSON body" };
    });

    // Log para ver el body recibido
    console.log("Body recibido:", JSON.stringify(body, null, 2));

    if (body.error) {
      return NextResponse.json({ error: body.error }, { status: 400 });
    }

    const orderId: string =
      typeof body?.orderId === "string" ? body.orderId : "";
    if (!orderId) {
      console.log(
        "Error: orderId es requerido pero no fue encontrado en el body."
      );
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }
    console.log(`orderId extraído: ${orderId}`);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Error de autenticación:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(`Usuario autenticado: ${user.id}`);

    // Llamada a la función RPC
    console.log(
      `Llamando a RPC 'accept_order' con orderId: ${orderId}, userId: ${user.id}`
    );
    const { data, error } = await supabase.rpc("accept_order", {
      p_order_id: orderId,
      p_user_id: user.id,
    });

    // Log para ver la respuesta de la RPC
    if (error) {
      console.error(
        "Error devuelto por Supabase RPC:",
        JSON.stringify(error, null, 2)
      );
      // Este error suele ser el culpable del 400. Puede ser por un tipo de dato incorrecto,
      // un nombre de parámetro erróneo, o que la función no exista.
      return NextResponse.json(
        { error: error.message || "Failed to call RPC function" },
        { status: 400 }
      );
    }

    console.log("Datos recibidos de la RPC:", JSON.stringify(data, null, 2));

    if (data && (data as any).error) {
      // Manejar errores lógicos devueltos por nuestra función SQL
      console.log(`Error lógico de la función SQL: ${(data as any).error}`);
      return NextResponse.json({ error: (data as any).error }, { status: 400 });
    }

    console.log("--- Solicitud completada exitosamente ---");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    console.error("--- Error inesperado en el bloque catch ---:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
