import { RestaurantListProps } from "@/src/components/features/admin/partners/partnersList/RestaurantList";
import { Restaurant } from "@/src/lib/admin/type";
import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";
import type { valueCategories } from "@/src/lib/type";

// Tamaño de página usado por el cliente (mantener en 5 para estar en sync con ClientShell)
const PAGE_SIZE = 5;

interface GetPartnersDataParams {
  page?: number;
  q?: string;
  type?: string; // UI type (e.g., restaurant | market | liquor_store)
  state?: string; // open | closed
  orderBy?: string; // id | name | totalOrders
  order?: string; // asc | desc
}

// Mapea la clave de orden del UI a la esperada por el RPC (snake/camel mismatches)
function mapSortByForRpc(orderBy?: string) {
  if (!orderBy) return null;
  if (orderBy === "totalOrders") return "totalorders" as const;
  // Allow only known columns
  if (["id", "name"].includes(orderBy)) return orderBy as "id" | "name";
  return null;
}

export default async function getPartnersData({
  page = 1,
  q = "",
  type = "",
  state = "",
  orderBy = "",
  order = "",
}: GetPartnersDataParams): Promise<RestaurantListProps> {
  const supabase = await createClient();

  // Ajustes de parámetros para el RPC
  const sortBy = mapSortByForRpc(orderBy);
  const sortOrder = order === "asc" || order === "desc" ? order : null;

  // El tipo en BD es partner_type (market | restaurant | liquor_store)
  // Permitimos que llegue vacío para no filtrar.
  const filterType = type || null;
  const filterState = state || null; // El RPC ya entiende open/closed si aplica

  const { data, error } = await supabase.rpc("get_partners", {
    filter_state: filterState,
    filter_type: filterType,
    page_num: page,
    page_size: PAGE_SIZE,
    search_query: q || null,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  if (error) {
    console.error("get_partners RPC error (raw):", error);
    console.error("get_partners RPC error (details):", {
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      code: (error as any)?.code,
    });
    console.error("get_partners RPC args:", {
      filter_state: filterState,
      filter_type: filterType,
      page_num: page,
      page_size: PAGE_SIZE,
      search_query: q || null,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    return { restaurants: [] };
  }

  const formatter = new Intl.NumberFormat("es-CO");

  console.log(data);

  type RpcRow =
    Database["public"]["Functions"]["get_partners"]["Returns"][number];

  const restaurants: Restaurant[] = (data || []).map((row: RpcRow) => {
    const uiType: valueCategories =
      (row.type as string) === "liquor_store"
        ? "alcohol"
        : (row.type as string as valueCategories);
    return {
      id: String(row.id),
      imageUrl: row.imageurl || "/ellipse.svg",
      name: row.name,
      nit: row.nit,
      address: row.address,
      type: uiType,
      totalOrders: formatter.format(Number(row.totalorders ?? 0)),
      state: row.state === "active" ? "open" : "closed",
    };
  });

  return { restaurants };
}
