"use server";

import { createClient } from "@/src/lib/supabase/server";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";

export interface TipHistoryItem {
  id: string;
  storeName: string;
  storeImage?: string | null;
  address: string;
  time: string;
  status: "Completado" | "Cancelado" | "En Curso"; // Normalized status for UI
  amount: number;
  date: Date;
}

export interface TipsHistoryData {
  thisWeek: TipHistoryItem[];
  thisMonth: TipHistoryItem[];
}

export async function getTipsHistory(): Promise<TipsHistoryData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { thisWeek: [], thisMonth: [] };
  }

  // Fetch shipments where driver is current user
  // Join orders to get tip_amount > 0 and partner/address details
  const { data: shipments, error } = await supabase
    .from("shipments")
    .select(
      `
      id,
      created_at,
      status,
      duration_seconds,
      order_details:orders!shipments_order_id_fkey!inner (
        id,
        tip_amount,
        partners (
          name,
          image_url
        ),
        user_addresses (
          alias,
          sector,
          location_number
        )
      )
    `,
    )
    .eq("driver_id", user.id)
    .gt("order_details.tip_amount", 0)
    .order("created_at", { ascending: false });

  if (error || !shipments) {
    console.error("Error fetching tips history:", error);
    return { thisWeek: [], thisMonth: [] };
  }

  const tips: TipHistoryItem[] = shipments.map((shipment) => {
    // Determine store name
    // @ts-ignore - supabase types sometimes nested weirdly with !inner
    const order = shipment.order_details;
    // @ts-ignore
    const partner = order?.partners;
    const storeName = partner?.name || "Tienda desconocida";
    const storeImage = partner?.image_url;

    // Determine address
    // @ts-ignore
    const addr = order?.user_addresses;
    let address = "Sin dirección";
    if (addr) {
      // Construct address like "Golf Villa 273"
      // Prioritize alias if it looks like a main name, or combine sector/location
      const parts = [];
      if (addr.alias) parts.push(addr.alias);
      if (addr.sector && addr.alias !== addr.sector) parts.push(addr.sector);
      if (addr.location_number) parts.push(addr.location_number);

      // If alias is just "Casa" or similar, maybe we want specific street?
      // For now, join what we have.
      address = parts.join(" ") || "Ubicación desconocida";
    }

    // Determine time (duration string)
    // If we have duration_seconds, use it. Else estimate or show created time?
    // Design says "35 Min". Likely duration.
    let time = "-- Min";
    if (shipment.duration_seconds) {
      const mins = Math.round(shipment.duration_seconds / 60);
      time = `${mins} Min`;
    }

    // Map status
    let uiStatus: TipHistoryItem["status"] = "En Curso";
    if (shipment.status === "delivered") uiStatus = "Completado";
    else if (shipment.status === "cancelled" || shipment.status === "failed")
      uiStatus = "Cancelado";

    // Amount
    // @ts-ignore
    const amount = order?.tip_amount || 0;

    return {
      id: shipment.id,
      storeName,
      storeImage,
      address,
      time,
      status: uiStatus,
      amount,
      date: new Date(shipment.created_at),
    };
  });

  // Split into "Esta Semana" and "Este Mes"
  // "Esta Semana" = Since start of current week
  // "Este Mes" = Since start of current month, excluding "Esta Semana" items?
  // Usually UI groups are exclusive. "This Week" (Top), "This Month" (Rest of current month).
  // Or "This Month" includes "This Week"? The design separates them.
  // I will make them exclusive for better UX. "Earlier this Month" basically.

  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
  const startOfCurrentMonth = startOfMonth(now);

  const thisWeek: TipHistoryItem[] = [];
  const thisMonth: TipHistoryItem[] = [];

  tips.forEach((tip) => {
    if (isAfter(tip.date, startOfCurrentWeek)) {
      thisWeek.push(tip);
    } else if (isAfter(tip.date, startOfCurrentMonth)) {
      thisMonth.push(tip);
    }
    // Items older than this month are ignored based on current request scope?
    // Or maybe "Este Mes" implies "Rest of history"? The design just has "Esta Semana" and "Este Mes".
    // I'll stick to current month for the second list.
  });

  return { thisWeek, thisMonth };
}
