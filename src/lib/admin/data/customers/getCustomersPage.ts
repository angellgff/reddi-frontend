import { createClient } from "@/src/lib/supabase/server";
import type { Tables } from "@/src/lib/database.types";

export type CustomerListItem = {
  id: string;
  fullName: string;
  phone: string | null;
  created_at: string | null;
  total_amount: number; // lifetime total of orders
};

export type CustomerFilters = {
  q?: string; // search by id, first_name, last_name, phone
};

export type CustomersPageResult = {
  customers: CustomerListItem[];
  total: number;
};

const PAGE_SIZE = 10;

function buildFullName(
  p: Pick<Tables<"profiles">, "first_name" | "last_name">
) {
  const parts = [p.first_name, p.last_name].filter(Boolean);
  return parts.length ? parts.join(" ") : "Usuario";
}

export default async function getCustomersPage(
  filters: CustomerFilters = {},
  page = 1,
  limit = PAGE_SIZE
): Promise<CustomersPageResult> {
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  // 1) Base query over profiles.
  // AHORA TAMBIÉN PEDIMOS EL 'created_at' DE LA TABLA 'users' RELACIONADA.
  let qp = supabase
    .from("profiles")
    .select(
      `
      id, 
      first_name, 
      last_name, 
      phone_number, 
      users ( created_at )
    `,
      {
        count: "exact",
      }
    )
    .eq("role", "user")
    .order("id", { ascending: true })
    .range(offset, offset + limit - 1);

  const { q } = filters;
  if (q && q.trim()) {
    const s = q.trim();
    // Search by id, first_name, last_name, phone_number
    qp = qp.or(
      `id.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%,phone_number.ilike.%${s}%`
    );
  }

  const { data: profiles, count, error } = await qp;
  if (error || !profiles) {
    // El error que tenías ocurría aquí si la relación no existía, pero ahora lo hemos solucionado.
    console.error("Error fetching customers page", error);
    return { customers: [], total: 0 };
  }

  const ids = profiles.map((p) => p.id);
  let totalsMap = new Map<string, number>();

  // Hemos eliminado la necesidad de createdAtMap

  if (ids.length) {
    // 2) Aggregate totals by user over orders for the current slice
    const { data: totalsData, error: totalsError } = await supabase
      .from("orders")
      .select("user_id, total:total_amount.sum()") // Usar .sum() es más limpio
      .in("user_id", ids)
      .group("user_id");

    if (totalsError) {
      console.error("Error fetching customer totals", totalsError);
    } else if (totalsData) {
      totalsData.forEach((row) => {
        // La suma vendrá en la propiedad 'total' que definimos en el select
        totalsMap.set(row.user_id, Number(row.total || 0));
      });
    }

    // 3) YA NO NECESITAMOS LA CONSULTA A 'normal_users'. La hemos eliminado.
  }

  const customers: CustomerListItem[] = profiles.map((p) => {
    // La fecha de creación ahora viene anidada dentro de la respuesta de 'profiles'
    // TypeScript puede que no lo sepa, así que usamos 'any' o definimos un tipo más complejo.
    const user_data = (p as any).users;
    const created = user_data ? user_data.created_at : null;

    return {
      id: p.id,
      fullName: buildFullName(p),
      phone: p.phone_number ?? null,
      created_at: created,
      total_amount: totalsMap.get(p.id) || 0,
    };
  });

  return { customers, total: count || 0 };
}
