import { createClient } from "@/src/lib/supabase/server";

export interface OrderDetailData {
  id: string;
  statusLabel: string;
  customerName: string;
  customerPhone: string | null;
  partnerId: string | null;
  userAddressId: string | null;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  eta: string;
  restaurantLogo: string;
  originCoords: [number, number] | null; // [lng, lat]
  destinationCoords: [number, number] | null; // [lng, lat]
  shipmentId: string | null;
  shipmentDriverId: string | null;
  orderStatus: string | null;
  canAccept: boolean;
  canContact: boolean;
  canMarkDelivered: boolean;
}

// Reutilizamos la misma lógica de mapeo simplificada usada en home
function mapDbStatusToDeliveryLabel(status?: string | null): string {
  const s = (status ?? "").toLowerCase();
  if (s === "pending" || s === "confirmed") return "Nueva";
  if (s === "preparing") return "Recogiendo";
  if (s === "out_for_delivery" || s === "on_the_way") return "Entregando";
  if (s === "delivered") return "Entregado";
  return "Nueva";
}

function formatEta(
  createdAt?: string | null,
  scheduledAt?: string | null
): string {
  try {
    if (scheduledAt) {
      const d = new Date(scheduledAt);
      return d.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (createdAt) {
      const ETA_MIN = 25;
      const diffMin = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / 60000
      );
      const remaining = Math.max(5, ETA_MIN - diffMin);
      return `${remaining} min`;
    }
  } catch {}
  return "25 min";
}

function formatAddress(
  addr?: {
    location_type?: string | null;
    location_number?: string | null;
  } | null
): string {
  const t = addr?.location_type ?? "";
  const n = addr?.location_number ?? "";
  return [t, n].filter(Boolean).join(" ") || "Dirección";
}

function extractPoint(geo: any): [number, number] | null {
  // Accept GeoJSON { type: 'Point', coordinates: [lng, lat] } or PostGIS text not handled
  if (
    geo &&
    typeof geo === "object" &&
    Array.isArray(geo.coordinates) &&
    geo.coordinates.length >= 2
  ) {
    const [lng, lat] = geo.coordinates;
    if (typeof lng === "number" && typeof lat === "number") return [lng, lat];
  }
  return null;
}

export default async function getOrderDetail(
  id: string
): Promise<OrderDetailData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuario no autenticado");
    }

    // --- INICIO DE CAMBIOS ---
    // Primero, obtenemos el ID del repartidor (de la tabla 'drivers') asociado al usuario actual.
    // Este ID es el que se usa en la tabla 'shipments'.
    const { data: driverProfile, error: driverError } = await supabase
      .from("drivers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (driverError) {
      console.error(
        "Error al buscar el perfil de repartidor:",
        driverError.message
      );
      throw new Error("No se pudo verificar el perfil de repartidor.");
    }

    const currentUserDriverId = driverProfile?.id ?? null;
    // --- FIN DE CAMBIOS ---

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id, created_at, scheduled_at, status, shipment_id, partner_id, user_address_id,
        partners(name,image_url,address,coordinates), 
        profiles(first_name, last_name, phone_number), 
        user_addresses(location_type,location_number,coordinates), 
        shipments!shipment_id(id, driver_id, status, origin_coordinates, destination_coordinates)
        `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      if (error) {
        console.error(
          `Error de Supabase al buscar pedido ${id}:`,
          error.message
        );
      }
      throw new Error("Pedido no encontrado");
    }

    const profile = (data as any).profiles;
    const customerName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      "Cliente";
    const customerPhone = profile?.phone_number ?? null;

    const orderStatus: string | null = (data as any).status ?? null;
    const statusLabel = mapDbStatusToDeliveryLabel(orderStatus);
    const restaurantName = (data as any).partners?.name ?? "Negocio";
    const restaurantAddress =
      (data as any).partners?.address ?? "Dirección del negocio";
    const restaurantLogo =
      (data as any).partners?.image_url ?? "/steakhouseorder.svg";
    const deliveryAddress = formatAddress((data as any).user_addresses);
    const originCoords =
      extractPoint((data as any).shipments?.origin_coordinates) ||
      extractPoint((data as any).partners?.coordinates);
    const destinationCoords =
      extractPoint((data as any).shipments?.destination_coordinates) ||
      extractPoint((data as any).user_addresses?.coordinates);
    const eta = formatEta((data as any).created_at, (data as any).scheduled_at);

    const shipmentId: string | null = (data as any)?.shipments?.id ?? null;
    const shipmentDriverId: string | null =
      (data as any)?.shipments?.driver_id ?? null;

    // --- LÓGICA DE PERMISOS CORREGIDA ---
    const isCancelled =
      (orderStatus ?? "").toLowerCase() === "cancelled" ||
      (orderStatus ?? "").toLowerCase() === "canceled";

    // La comparación ahora usa el ID de la tabla 'drivers' del usuario actual
    const assignedToCurrent =
      currentUserDriverId && shipmentDriverId === currentUserDriverId;

    const canAccept = !shipmentDriverId && !isCancelled;
    const canContact = assignedToCurrent;
    const canMarkDelivered = assignedToCurrent && !isCancelled;
    // --- FIN DE LÓGICA CORREGIDA ---

    // Logs opcionales para verificar (puedes quitarlos después)
    console.log(
      `--- VERIFICACIÓN [canMarkDelivered] para Pedido ID: ${id} ---`
    );
    console.log(
      `- ID del driver en el envío (shipmentDriverId): '${shipmentDriverId}'`
    );
    console.log(
      `- ID de repartidor del usuario actual (currentUserDriverId): '${currentUserDriverId}'`
    );
    console.log(
      `- El pedido está asignado a este usuario (assignedToCurrent): ${assignedToCurrent}`
    );
    console.log(`- El pedido está cancelado (isCancelled): ${isCancelled}`);
    console.log(`- RESULTADO FINAL: canMarkDelivered es: ${canMarkDelivered}`);
    console.log("----------------------------------------------------------");

    return {
      id: String((data as any).id),
      statusLabel,
      customerName,
      customerPhone,
      partnerId: (data as any)?.partner_id ?? null,
      userAddressId: (data as any)?.user_address_id ?? null,
      restaurantName,
      restaurantAddress,
      deliveryAddress,
      eta,
      restaurantLogo,
      originCoords,
      destinationCoords,
      shipmentId,
      shipmentDriverId,
      orderStatus,
      canAccept,
      canContact,
      canMarkDelivered,
    };
  } catch (error: any) {
    console.error(`Fallo al obtener detalle del pedido ${id}:`, error.message);

    if (
      error.message === "Pedido no encontrado" ||
      error.message === "Usuario no autenticado" ||
      error.message === "No se pudo verificar el perfil de repartidor."
    ) {
      throw error;
    }

    throw new Error("Pedido no encontrado");
  }
}
