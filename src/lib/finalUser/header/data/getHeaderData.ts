import { UserHeaderData } from "@/src/lib/finalUser/type";

// Utilidad para el tiempo de respuesta de la API
import { getRandomNumberFrom1To10 } from "@/src/lib/utils";
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
  // Evitar que un timeout corto rompa el Header. Si tarda, seguimos como invitado.
  let user: Record<string, unknown> | null = null;
  try {
    const raceResult = (await Promise.race([
      supabase.auth.getUser(),
      new Promise<{ data: { user: Record<string, unknown> | null } }>(
        (resolve) => setTimeout(() => resolve({ data: { user: null } }), 5000)
      ),
    ])) as { data: { user: Record<string, unknown> | null } };
    user = raceResult?.data?.user || null;
  } catch (e) {
    console.log(e);
    // Silenciar errores aquí para que el layout no falle
  }
  console.log("[getHeaderData] user", { user });
  const meta = (user?.user_metadata as Record<string, unknown>) || {};

  const userName: string =
    (meta.full_name as string) ||
    (meta.name as string) ||
    (user?.email as string)?.split("@")[0] ||
    "Invitado";

  // Intentamos mapear direcciones desde user_metadata (ej: addresses: [{ id, address, label }])
  let address: UserHeaderData["address"] = [];
  const metaAddresses = meta.addresses || meta.address || null;
  if (Array.isArray(metaAddresses)) {
    address = metaAddresses
      .map((a: Record<string, unknown>, idx: number) => ({
        id: typeof a?.id === "number" ? a.id : idx + 1,
        address: String(a?.address || a?.street || a?.line || ""),
        label: String(a?.label || a?.type || "Casa"),
      }))
      .filter((a) => !!a.address);
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
