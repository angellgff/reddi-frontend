import { createClient } from "@/src/lib/supabase/server";
import * as Sentry from "@sentry/nextjs";

export interface OrderDetailItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  variantName?: string;
}

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
  deliverySector: string;
  deliveryInstructions: string;
  customerNote: string;
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
  totalAmount: number;
  paymentMethod: "cash" | "physical_pos" | null;
  items: OrderDetailItem[];
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
  scheduledAt?: string | null,
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
        (Date.now() - new Date(createdAt).getTime()) / 60000,
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
  } | null,
): string {
  const t = addr?.location_type ?? "";
  const n = addr?.location_number ?? "";
  return [t, n].filter(Boolean).join(" ") || "Dirección";
}

function extractPoint(geo: unknown): [number, number] | null {
  if (!geo) return null;

  if (typeof geo === "string") {
    // 1. Caso Hexadecimal string (PostGIS encodings como WKB/EWKB)
    // Ej: "0101000020E6100000..."
    if (/^[0-9a-fA-F]+$/.test(geo) && geo.length >= 42) {
      try {
        const bytes = new Uint8Array(
          geo.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
        );
        const view = new DataView(bytes.buffer);
        // Byte 0: Endianness (1 = Little Endian)
        const isLittle = view.getUint8(0) === 1;
        // Bytes 1-4: Type
        const type = view.getUint32(1, isLittle);

        // SRID mask 0x20000000 -> Si está presente, saltar 4 bytes extra
        let offset = 5;
        if (type & 0x20000000) {
          offset += 4;
        }
        
        // Z mask 0x80000000 -> Si hay Z, hay que leerlo (o solo saber coords 2D)
        // M mask 0x40000000 -> Si hay M...
        // Asumiendo Point standard 2D o PointZ simple

        const lng = view.getFloat64(offset, isLittle);
        const lat = view.getFloat64(offset + 8, isLittle);
        return [lng, lat];
      } catch (e) {
        // Fallback or ignore
      }
    }

    // 2. Caso WKT string: "POINT(-69.9312 18.4812)"
    const match = geo.match(/POINT\s*\(([^)]+)\)/i);
    if (match && match[1]) {
      const parts = match[1].trim().split(/\s+/);
      if (parts.length >= 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lng) && !isNaN(lat)) {
          return [lng, lat];
        }
      }
    }
    return null;
  }

  // 3. Caso GeoJSON Object: { type: 'Point', coordinates: [lng, lat] }
  if (
    typeof geo === "object" &&
    "coordinates" in geo &&
    Array.isArray((geo as { coordinates: unknown }).coordinates) &&
    (geo as { coordinates: unknown[] }).coordinates.length >= 2
  ) {
    const [lng, lat] = (geo as { coordinates: [number, number] }).coordinates;
    if (typeof lng === "number" && typeof lat === "number") return [lng, lat];
  }
  
  return null;
}

export default async function getOrderDetail(
  id: string,
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
        driverError.message,
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
        total_amount, payment_method, instructions,
        partners(name,image_url,address,coordinates), 
        profiles(first_name, last_name, phone_number), 
        user_addresses(location_type,location_number,coordinates,sector,delivery_instructions), 
        shipments!shipment_id(id, driver_id, status, origin_coordinates, destination_coordinates),
        order_detail(
          id, quantity, unit_price,
          products(name),
          product_variants(name, product_variant_groups(name))
        )
        `,
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      if (error) {
        console.error(
          `Error de Supabase al buscar pedido ${id}:`,
          error.message,
        );
      }
      throw new Error("Pedido no encontrado");
    }

    const pData = data.profiles;
    const profile = Array.isArray(pData) ? pData[0] : pData;

    const customerName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      "Cliente";
    const customerPhone = profile?.phone_number ?? null;

    const orderStatus: string | null = data.status ?? null;
    const statusLabel = mapDbStatusToDeliveryLabel(orderStatus);

    const partnerData = data.partners;
    const partner = Array.isArray(partnerData) ? partnerData[0] : partnerData;

    const restaurantName = partner?.name ?? "Negocio";
    const restaurantAddress = partner?.address ?? "Dirección del negocio";
    const restaurantLogo = partner?.image_url ?? "/steakhouseorder.svg";

    const uaData = data.user_addresses;
    const userAddress = Array.isArray(uaData) ? uaData[0] : uaData;

    const deliveryAddress = formatAddress(userAddress);
    const deliverySector = (userAddress as any)?.sector ?? "";
    const deliveryInstructions =
      (userAddress as any)?.delivery_instructions ?? "";
    const customerNote = data.instructions ?? ""; // Nota en la orden

    const shipData = data.shipments;
    const shipment = Array.isArray(shipData) ? shipData[0] : shipData;

    console.log("DEBUG GEO:", {
       shipmentOrigin: shipment?.origin_coordinates,
       partnerCoords: partner?.coordinates,
       shipmentDest: shipment?.destination_coordinates,
       userCoords: userAddress?.coordinates
    });

    const originCoords =
      extractPoint(shipment?.origin_coordinates) ||
      extractPoint(partner?.coordinates);
    const destinationCoords =
      extractPoint(shipment?.destination_coordinates) ||
      extractPoint(userAddress?.coordinates);
    const eta = formatEta(data.created_at, data.scheduled_at);

    const shipmentId: string | null = shipment?.id ?? null;
    const shipmentDriverId: string | null = shipment?.driver_id ?? null;

    const items: OrderDetailItem[] = (data.order_detail || []).map(
      (item: any) => {
        const pName = item.products?.name || "Producto sin nombre";
        const vName = item.product_variants?.name
          ? `${item.product_variants.name}`
          : undefined;

        return {
          id: String(item.id),
          name: pName,
          variantName: vName,
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
          price: typeof item.unit_price === "number" ? item.unit_price : 0,
        };
      },
    );

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
      `--- VERIFICACIÓN [canMarkDelivered] para Pedido ID: ${id} ---`,
    );
    console.log(
      `- ID del driver en el envío (shipmentDriverId): '${shipmentDriverId}'`,
    );
    console.log(
      `- ID de repartidor del usuario actual (currentUserDriverId): '${currentUserDriverId}'`,
    );
    console.log(
      `- El pedido está asignado a este usuario (assignedToCurrent): ${assignedToCurrent}`,
    );
    console.log(`- El pedido está cancelado (isCancelled): ${isCancelled}`);
    console.log(`- RESULTADO FINAL: canMarkDelivered es: ${canMarkDelivered}`);
    console.log("----------------------------------------------------------");

    return {
      id: String(data.id),
      statusLabel,
      customerName,
      customerPhone,
      partnerId: data.partner_id ?? null,
      userAddressId: data.user_address_id ?? null,
      items,
      deliverySector,
      deliveryInstructions,
      customerNote,
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
      totalAmount: data.total_amount ?? 0,
      paymentMethod: (data.payment_method as "cash" | "physical_pos") ?? "cash",
    };
  } catch (error: unknown) {
    Sentry.captureException(error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error(`Fallo al obtener detalle del pedido ${id}:`, message);

    if (
      message === "Pedido no encontrado" ||
      message === "Usuario no autenticado" ||
      message === "No se pudo verificar el perfil de repartidor."
    ) {
      throw error;
    }

    throw new Error("Pedido no encontrado");
  }
}
