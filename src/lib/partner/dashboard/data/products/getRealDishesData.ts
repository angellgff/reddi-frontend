import { createClient } from "@/src/lib/supabase/server";
import { DishData } from "@/src/lib/partner/dashboard/type";

export interface FetchDishesParams {
  q?: string | string[];
  category?: string | string[]; // sub_category_id
  tag?: string | string[];
  partnerId?: string;
}

// Maps DB row to DishData (placeholders are fine)
function mapRowToDish(row: any): DishData {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url || "/tacos.svg",
    rating: "4.8",
    reviewCount: 0,
    deliveryTime: row.estimated_time || "--",
    deliveryFee: "0$ tarifa de envío",
  };
}

export default async function getRealDishesData(
  params: FetchDishesParams = {}
): Promise<DishData[]> {
  const supabase = await createClient();

  // --- PASO 1: Obtener el usuario y su partner_id (CRÍTICO) ---
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn(
      "getRealDishesData: No user session found. Returning empty array."
    );
    return [];
  }

  // Buscar el partner asociado al usuario (partners.user_id -> partners.id)
  const { data: partner, error: pErr } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const partnerId = partner?.id;

  if (!partnerId) {
    console.error(
      `getRealDishesData: No partner_id found for user ${user.id}.`
    );
    return [];
  }

  // --- PASO 2: Construir la consulta CON el filtro del partner ---
  let query = supabase
    .from("products")
    .select("id,name,image_url,estimated_time,is_available,sub_category_id")
    // Este filtro es OBLIGATORIO para asegurar que el partner solo vea sus productos
    .eq("partner_id", partnerId); // Asegúrate de que tu columna se llame 'partner_id'

  // Filtro de búsqueda por texto (tu lógica es correcta)
  if (params.q && typeof params.q === "string" && params.q.trim()) {
    query = query.ilike("name", `%${params.q.trim()}%`);
  }

  // Filtro de categoría (tu lógica también es correcta)
  if (
    params.category &&
    typeof params.category === "string" &&
    params.category
  ) {
    query = query.eq("sub_category_id", params.category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products", error);
    return [];
  }

  return (data || []).map(mapRowToDish);
}
