import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { calculateShipmentDetails } from "@/src/lib/shipping/calculateShipmentDetails";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const partnerId = typeof body?.partnerId === "string" ? body.partnerId : "";
    const userAddressId =
      typeof body?.userAddressId === "string" ? body.userAddressId : "";

    console.log("[shipping/calculate] POST body:", {
      partnerIdPresent: Boolean(partnerId),
      userAddressIdPresent: Boolean(userAddressId),
    });

    if (!partnerId || !userAddressId) {
      console.warn("[shipping/calculate] Missing ids", {
        partnerId,
        userAddressId,
      });
      return NextResponse.json(
        { error: "partnerId and userAddressId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const details = await calculateShipmentDetails(
      supabase as any,
      partnerId,
      userAddressId
    );

    console.log("[shipping/calculate] Success", {
      distanceMeters: details.distanceMeters,
      durationSeconds: details.durationSeconds,
      shippingCost: details.shippingCost,
    });
    return NextResponse.json(details, { status: 200 });
  } catch (err: any) {
    console.error("[shipping/calculate] Error: ", err?.message, err?.stack);
    const message =
      typeof err?.message === "string" && err.message
        ? err.message
        : "Failed to calculate the route.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
