import { createClient } from "@/src/lib/supabase/server";
import { DishData } from "@/src/lib/partner/dashboard/type";

export interface FetchDishesParams {
  q?: string | string[];
  category?: string | string[]; // sub_category_id
  tag?: string | string[];
  partnerId?: string;
  isAvailable?: string | string[];
}

type DishRow = {
  id: string;
  name: string;
  image_url: string | null;
  estimated_time: string | null;
  is_available: boolean;
  product_sub_categories?: Array<{
    sub_category_id: string;
  }>;
};

// Maps DB row to DishData (placeholders are fine)
function mapRowToDish(row: DishRow): DishData {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url || "/tacos.svg",
    rating: "4.8",
    reviewCount: 0,
    deliveryTime: row.estimated_time || "--",
    deliveryFee: "0$ tarifa de envío",
    isAvailable: row.is_available,
  };
}

export default async function getRealDishesData(
  params: FetchDishesParams = {},
): Promise<DishData[]> {
  const supabase = await createClient();

  // --- PASO 1: Obtener el usuario y su partner_id (CRÍTICO) ---
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn(
      "getRealDishesData: No user session found. Returning empty array.",
    );
    return [];
  }

  // Buscar el partner asociado al usuario (partners.user_id -> partners.id)
  const { data: partner } = await supabase
    .from("partners")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  const partnerId = partner?.id;

  if (!partnerId) {
    console.error(
      `getRealDishesData: No partner_id found for user ${user.id}.`,
    );
    return [];
  }

  // --- PASO 2: Construir la consulta CON el filtro del partner ---
  let query = supabase
    .from("products")
    .select(
      "id,name,image_url,estimated_time,is_available,product_sub_categories(sub_category_id)",
    )
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
    query = query.eq("product_sub_categories.sub_category_id", params.category);
  }

  // Filtro de disponibilidad
  // Lógica: Si params.isAvailable no está presente, asumimos "true" (solo disponibles).
  // Si es "true", filtramos is_available = true.
  // Si es "false", filtramos is_available = false.
  // Si es "all", NO filtramos por is_available.
  const availabilityParam = Array.isArray(params.isAvailable)
    ? params.isAvailable[0]
    : params.isAvailable;

  if (availabilityParam === "false") {
    query = query.eq("is_available", false);
  } else if (availabilityParam === "all") {
    // No filter applied for 'all'
  } else {
    // Default or explicitly 'true'
    query = query.eq("is_available", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products", error);
    return [];
  }

  return (data || []).map(mapRowToDish);
}
