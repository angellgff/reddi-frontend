import { createClient } from "@/src/lib/supabase/server";

export interface HistoryOrderItem {
  orderId: string;
  restaurantName: string;
  address: string;
  deliveredAt: string; // formatted time string
  tip: string; // formatted currency
  statusLabel: string; // Finalizado
  logoUrl: string;
}

// Helper functions (formatAddress, formatDeliveredTime, formatTip) remain the same...

function formatAddress(
  addr?: {
    location_type?: string | null;
    location_number?: string | null;
  } | null
): string {
  const t = addr?.location_type ?? "";
  const n = addr?.location_number ?? "";
  return [t, n].filter(Boolean).join(" ") || "Dirección no disponible";
}

function formatDeliveredTime(ts?: string | null): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return sameDay
      ? `Hoy, ${time}`
      : `${d.toLocaleDateString("es-MX")} ${time}`;
  } catch {
    return "";
  }
}

function formatTip(amount?: number | null): string {
  try {
    const v = amount ?? 0;
    return v.toLocaleString("es-MX", { style: "currency", currency: "USD" });
  } catch {
    return "$0.00";
  }
}

export default async function getHistoryOrders(): Promise<HistoryOrderItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("getHistoryOrders: No user found. Returning empty array.");
    return [];
  }

  // --- PASO 1: Encontrar el ID del perfil del repartidor (driver) usando el ID del usuario ---
  const { data: driverProfile, error: driverError } = await supabase
    .from("drivers")
    .select("id") // Solo necesitamos el ID del repartidor
    .eq("user_id", user.id) // Unimos la tabla 'drivers' con el usuario autenticado
    .single(); // Esperamos un único perfil de repartidor por usuario

  if (driverError || !driverProfile) {
    console.error(
      `Error finding driver profile for user ${user.id}:`,
      driverError
    );
    // Si el usuario no tiene un perfil de repartidor, no tiene historial.
    return [];
  }

  const driverId = driverProfile.id; // Este es el ID que debemos usar en la tabla 'shipments'

  // --- PASO 2: Usar el ID del repartidor para obtener sus envíos (shipments) ---
  const { data, error } = await supabase
    .from("shipments")
    .select(
      `
      actual_delivery_at,
      orders!shipments_order_id_fkey (
        id,
        status,
        tip_amount,
        partners (name, image_url),
        user_addresses (location_type, location_number)
      )
    `
    )
    .eq("driver_id", driverId) // ¡Ahora usamos el ID correcto!
    .eq("orders.status", "delivered")
    .order("actual_delivery_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error(
      "Supabase query error details:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }

  // El resto del mapeo ya era correcto.
  const list: HistoryOrderItem[] = (data ?? [])
    .map((shipment: any) => {
      const o = shipment.orders;
      if (!o) return null;

      return {
        orderId: String(o.id),
        restaurantName: o.partners?.name ?? "Negocio",
        address: formatAddress(o.user_addresses ?? undefined),
        deliveredAt: formatDeliveredTime(shipment.actual_delivery_at),
        tip: formatTip(o.tip_amount),
        statusLabel: "Finalizado",
        logoUrl: o.partners?.image_url ?? "/steakhouseorder.svg",
      } satisfies HistoryOrderItem;
    })
    .filter((item): item is HistoryOrderItem => item !== null);

  return list;
}
