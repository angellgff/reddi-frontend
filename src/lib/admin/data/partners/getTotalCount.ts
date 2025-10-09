import { createClient } from "@/src/lib/supabase/server";

type Params = {
  q?: string;
  type?: string; // partner_type in DB
  state?: string; // open | closed
};

export default async function getTotalCount(params: Params = {}) {
  const supabase = await createClient();
  const { q = "", type = "", state = "" } = params;

  // Construimos un query al view/table partners con filtros equivalentes.
  // Nota: usamos partners base; asumiendo que el estado open/closed se deriva de is_approved o similar.
  // Si get_partners aplica una lógica distinta para "state", se recomienda crear un RPC count paralelo.
  let query = supabase
    .from("partners")
    .select("id, name, address, user_rnc, partner_type, image_url", {
      count: "exact",
      head: true,
    });

  if (type) query = query.eq("partner_type", type);

  // Búsqueda básica en name, user_rnc (como NIT), y address
  if (q) {
    // ILIKE solo disponible en postgres text; combinamos con or
    query = query.or(
      `name.ilike.%${q}%,user_rnc.ilike.%${q}%,address.ilike.%${q}%`
    );
  }

  // Para "state", sin un campo dedicado, intentamos mapear a is_approved como ejemplo:
  // open -> is_approved = true, closed -> is_approved = false
  if (state === "open") query = query.eq("is_approved", true);
  if (state === "closed") query = query.eq("is_approved", false);

  const { count, error } = await query;

  if (error) {
    console.error("partners count error:", error);
    return 0;
  }

  return count || 0;
}
