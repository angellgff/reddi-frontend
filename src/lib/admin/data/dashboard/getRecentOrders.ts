import { createClient } from "@/src/lib/supabase/server";
import type { Database, Tables } from "@/src/lib/database.types"; // <-- Asegúrate de que esta ruta sea correcta

// Alias para los tipos de fila para mayor claridad
type OrderRow = Tables<"orders">;
type ProfileRow = Tables<"profiles">;

export type RecentOrder = {
  id: string;
  created_at: string;
  status: OrderRow["status"];
  total_amount: number;
  user_id: string;
  customerName?: string;
};

// Un subconjunto del tipo ProfileRow que solo contiene lo que necesitamos para el nombre.
type ProfileForName = Pick<ProfileRow, "first_name" | "last_name">;

/**
 * Deriva un nombre de cliente a partir de la información del perfil.
 * No necesita cambios, ya que su lógica sigue siendo la misma.
 */
function deriveName(p?: ProfileForName | null, fallbackId?: string): string {
  if (!p) {
    return fallbackId ? fallbackId.slice(0, 8) : "Usuario";
  }
  const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return (
    fullName ||
    p.first_name ||
    (fallbackId ? fallbackId.slice(0, 8) : "Usuario")
  );
}

export default async function getRecentOrders(
  limit = 10
): Promise<RecentOrder[]> {
  const supabase = await createClient();

  // Hacemos una sola petición que une 'orders' con 'profiles'
  const { data: ordersWithProfiles, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      status,
      total_amount,
      user_id,
      profiles ( first_name, last_name )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !ordersWithProfiles) {
    console.error("Error fetching recent orders with profiles:", error);
    return [];
  }

  // Ahora, simplemente mapeamos el resultado combinado a la forma que deseamos.
  // Ya no necesitamos una segunda consulta ni lógica extra.
  return ordersWithProfiles.map((o) => ({
    id: o.id,
    created_at: o.created_at,
    status: o.status,
    total_amount: o.total_amount,
    user_id: o.user_id,
    // El perfil viene anidado en la respuesta.
    // 'o.profiles' puede ser null si la relación no encuentra una coincidencia.
    customerName: deriveName(
      Array.isArray(o.profiles) ? o.profiles[0] : o.profiles,
      o.user_id
    ),
  }));
}
