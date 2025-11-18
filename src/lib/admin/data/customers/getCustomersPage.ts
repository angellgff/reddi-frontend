import { createClient } from "@/src/lib/supabase/server";
// No necesitas 'Tables' aquí porque el resultado del RPC no está tipado automáticamente
// pero puedes crear un tipo si quieres más seguridad.

export type CustomerListItem = {
  id: string;
  fullName: string;
  phone: string | null;
  created_at: string | null;
  total_amount: number; // La función SQL devuelve NUMERIC, que JS interpreta como string o number. Lo casteamos.
};

export type CustomerFilters = {
  q?: string;
};

export type CustomersPageResult = {
  customers: CustomerListItem[];
  total: number;
};

const PAGE_SIZE = 10;

// La función 'buildFullName' ya no es necesaria aquí, la DB lo hace por nosotros.

export default async function getCustomersPage(
  filters: CustomerFilters = {},
  page = 1,
  limit = PAGE_SIZE
): Promise<CustomersPageResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_customers_page", {
    search_query: filters.q || "", // Pasa el término de búsqueda, o un string vacío si no hay.
    page_number: page,
    page_size: limit,
  });

  if (error) {
    console.error("Error calling get_customers_page RPC", error);
    return { customers: [], total: 0 };
  }

  if (!data || data.length === 0) {
    return { customers: [], total: 0 };
  }

  // El total de registros es el mismo en todas las filas, así que lo tomamos del primer resultado.
  const total = data[0].total_records || 0;

  // Mapeamos los resultados para asegurar que el tipo `total_amount` sea un número
  interface GetCustomersPageRow {
    id: string;
    fullname: string;
    phone: string | null;
    created_at: string | null;
    total_amount: number | string | null;
    total_records?: number;
  }

  const customers: CustomerListItem[] = (data as GetCustomersPageRow[]).map(
    (row: GetCustomersPageRow): CustomerListItem => ({
      id: row.id,
      fullName: row.fullname,
      phone: row.phone,
      created_at: row.created_at,
      total_amount: Number(row.total_amount || 0),
    })
  );

  return { customers, total };
}
