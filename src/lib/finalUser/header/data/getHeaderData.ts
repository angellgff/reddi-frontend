import { UserHeaderData } from "@/src/lib/finalUser/type";

// Utilidad para el tiempo de respuesta de la API
import { getRandomNumberFrom1To10, withTimeout } from "@/src/lib/utils";
import { createClient } from "@/src/lib/supabase/server";

const apiDelay = 0; // sin delay artificial al usar sesión real

// HeaderData
export default async function getHeaderData(): Promise<UserHeaderData> {
  // Pequeña espera opcional si se quisiera simular latencia
  if (apiDelay > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, apiDelay * getRandomNumberFrom1To10())
    );
  }

  const supabase = await createClient();
  const { data: userData } = await withTimeout(
    supabase.auth.getUser(),
    1200,
    "auth-timeout"
  );
  const user = userData.user;
  console.log("[getHeaderData] user", { user });
  const meta = (user?.user_metadata as Record<string, any>) || {};

  const userName: string =
    meta.full_name || meta.name || user?.email?.split("@")[0] || "Invitado";

  // Intentamos mapear direcciones desde user_metadata (ej: addresses: [{ id, address, label }])
  let address: UserHeaderData["address"] = [];
  const metaAddresses = meta.addresses || meta.address || null;
  if (Array.isArray(metaAddresses)) {
    address = metaAddresses
      .map((a: any, idx: number) => ({
        id: typeof a?.id === "number" ? a.id : idx + 1,
        address: String(a?.address || a?.street || a?.line || ""),
        label: String(a?.label || a?.type || "Casa"),
      }))
      .filter((a: any) => !!a.address);
  } else if (typeof metaAddresses === "string") {
    address = [
      {
        id: 1,
        address: metaAddresses,
        label: String(meta.address_label || "Casa"),
      },
    ];
  }

  // Fallback seguro: garantizar al menos un elemento para evitar errores en el Header
  if (!address || address.length === 0) {
    const fallback = "Dirección no configurada";
    address = [
      {
        id: 1,
        address: String(fallback),
        label: "Principal",
      },
    ];
  }

  const notificationCount = Number(
    meta.notificationCount ?? meta.notifications ?? 0
  );
  const carCount = Number(meta.carCount ?? meta.cartCount ?? 0);

  return {
    userName,
    address,
    notificationCount,
    carCount,
  };
}
