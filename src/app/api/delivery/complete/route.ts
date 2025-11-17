import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId: string =
      typeof body?.orderId === "string" ? body.orderId : "";
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TypeScript ahora sabe que 'mark_delivery_as_complete' existe.
    // También sabe que necesita 'order_id_param' y 'caller_user_id_param' como strings.
    // Si escribes mal un parámetro o le pasas un tipo incorrecto, te avisará.
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "mark_delivery_as_complete",
      {
        order_id_param: orderId,
        caller_user_id_param: user.id,
      }
    );

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      return NextResponse.json(
        { error: "Failed to process delivery completion" },
        { status: 500 }
      );
    }

    // TypeScript también sabe que 'rpcResult' será de tipo `string | null`
    // lo que hace que este switch sea más seguro.
    switch (rpcResult) {
      case "OK":
        return NextResponse.json({ ok: true }, { status: 200 });
      case "FORBIDDEN":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      case "ORDER_OR_SHIPMENT_NOT_FOUND":
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      case "ORDER_CANCELLED":
        return NextResponse.json(
          { error: "Order is cancelled" },
          { status: 400 }
        );
      default:
        // El caso por defecto maneja cualquier respuesta inesperada o `null`.
        return NextResponse.json(
          { error: "An unexpected error occurred" },
          { status: 500 }
        );
    }
  } catch (e: any) {
    console.error("Handler Exception:", e.message);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
