import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { isActiveOrderStatus } from "@/src/lib/partner/dashboard/utils/orderStatus";

type OrderListItem = {
  id: string;
  created_at: string;
  status: string | null;
  total_amount: number;
  partner_id: string | null;
  partner: {
    id: string | null;
    name: string | null;
    image_url: string | null;
    address?: string | null;
  } | null;
};

function currency(n: number | null | undefined) {
  try {
    if (n == null) return "--";
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return String(n ?? "");
  }
}

export default async function OrdersHistoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard: unauthenticated (middleware should handle this already)
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-12 py-10">
        <div className="rounded-2xl border bg-white p-8">
          Inicia sesión para ver tu historial.
        </div>
      </div>
    );
  }

  const page = Math.max(1, Number(searchParams?.page ?? 1) || 1);
  const pageSize = 5; // muestra 5 por página como en el mock
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch orders with partner info
  const query = supabase
    .from("orders")
    .select(
      "id, created_at, status, total_amount, partner_id, partners:partner_id(id, name, image_url, address)",
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data, count } = await query;

  const items: OrderListItem[] = (data || []).map((o: unknown) => {
    const row = o as {
      id: string;
      created_at: string;
      status?: string | null;
      total_amount?: number | null;
      partner_id?: string | null;
      partners?: {
        id?: string;
        name?: string;
        image_url?: string;
        address?: string;
      } | null;
    };
    return {
      id: String(row.id),
      created_at: row.created_at,
      status: row.status ?? null,
      total_amount: row.total_amount ?? 0,
      partner_id: row.partner_id ?? null,
      partner: row.partners
        ? {
            id: row.partners.id ?? null,
            name: row.partners.name ?? null,
            image_url: row.partners.image_url ?? null,
            address: row.partners.address ?? null,
          }
        : null,
    };
  });

  const total = count ?? items.length;
  const startItem = Math.min(total, from + 1);
  const endItem = Math.min(total, to + 1);
  const totalPages = Math.max(1, Math.ceil((total || 1) / pageSize));

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header */}
      <header className="flex flex-col justify-center items-start px-4 sm:px-6 lg:px-12 py-6 sm:py-8 gap-3 bg-white">
        <h1 className="text-xl sm:text-2xl font-bold">Historial de pedidos</h1>
        <p className="text-xs sm:text-sm text-[#6C7280] max-w-prose">
          Revisa tus pedidos anteriores y vuelve a pedir fácilmente
        </p>
      </header>

      {/* List section */}
      <section className="flex flex-col items-start gap-6 bg-white px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 pb-10">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[#6C7280]">Mis pedidos anteriores</span>
          <span className="inline-flex h-6 items-center rounded-full bg-[#ECFDF5] px-2 text-xs font-medium text-[#047857]">
            {total} pedidos
          </span>
        </div>

        <div className="w-full flex flex-col divide-y divide-[#E5E7EB]">
          {items.length === 0 && (
            <div className="py-10 text-sm text-[#6C7280]">
              No tienes pedidos aún.
            </div>
          )}

          {items.map((it) => {
            const active = isActiveOrderStatus(it.status);
            const storeHref = it.partner?.id
              ? `/user/stores/${it.partner.id}`
              : "/user/stores";
            return (
              <div
                key={it.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* left: store info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* --- CAMBIO 1 ---
      Se eliminó "grid place-items-center".
      Esto evita que el layout del contenedor interfiera con el tamaño de la imagen.
  */}
                  <div className="h-[74px] w-[126px] sm:h-[66px] sm:w-[66px] flex-shrink-0 overflow-hidden rounded-xl border border-[#D9DCE3] bg-[#F0F2F5]">
                    {it.partner?.image_url ? (
                      <Image
                        src={it.partner.image_url}
                        alt={it.partner?.name ?? "Tienda"}
                        width={126}
                        height={74}
                        /* --- CAMBIO 2 (EL MÁS IMPORTANTE) ---
            - "object-contain": Asegura que la imagen completa quepa dentro del contenedor sin cortarse.
            - "sm:object-cover": En pantallas más grandes, volvemos a cortar la imagen para que llene el espacio cuadrado sin distorsionarse.
        */
                        className="object-contain sm:object-cover h-full w-full"
                      />
                    ) : (
                      // Añadimos flexbox aquí para centrar el texto "Logo" ahora que quitamos el grid
                      <div className="flex h-full w-full items-center justify-center text-xs text-[#9BA1AE]">
                        Logo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    {/* ...el resto del código sigue igual... */}
                    <div className="text-sm font-semibold truncate">
                      {it.partner?.name ?? "Tienda"}
                    </div>
                    <div className="text-[11px] sm:text-xs text-[#6C7280] flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="inline-flex items-center gap-1">
                        <span>4.8</span>
                        <span className="text-[#9BA1AE]">(245)</span>
                      </span>
                      <span className="hidden xs:inline">•</span>
                      <span>25-35 min</span>
                      <span className="hidden xs:inline">•</span>
                      <span>$0 envío</span>
                    </div>
                    <div className="text-[11px] text-[#0F766E]">
                      {currency(it.total_amount)}
                    </div>
                  </div>
                </div>

                {/* right: actions */}
                {/* --- CAMBIO AQUÍ --- 
                    El contenedor de botones ahora ocupa el ancho completo en móviles (w-full) y vuelve a su tamaño automático en 'sm' (sm:w-auto).
                    Los botones usan flex-1 para compartir el espacio equitativamente.
                */}
                <div className="w-full sm:w-auto flex items-center gap-2">
                  <Link
                    href={`/user/orders/${it.id}`}
                    className="h-9 flex flex-1 items-center justify-center rounded-xl border border-[#9BA1AE] px-4 text-xs font-medium hover:bg-gray-50"
                  >
                    Ver detalle
                  </Link>
                  {active && (
                    <Link
                      href={`/user/orders/${it.id}`}
                      className="h-9 flex flex-1 items-center justify-center rounded-xl border border-[#04BD88] text-[#047857] px-4 text-xs font-medium bg-[#ECFDF5] hover:bg-[#D1FAE5]"
                    >
                      Hacer seguimiento
                    </Link>
                  )}
                  <Link
                    href={storeHref}
                    className="h-9 flex flex-1 items-center justify-center rounded-xl border border-black px-4 text-xs font-medium hover:bg-gray-50"
                  >
                    Pedir otra vez
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="w-full flex items-center justify-between pt-4 text-xs text-[#6C7280]">
            <div>
              {startItem}-{endItem} de {total}
            </div>
            <div className="flex items-center gap-2">
              <Link
                aria-disabled={page <= 1}
                className={`h-8 w-8 grid place-items-center rounded-lg border ${
                  page <= 1 ? "opacity-40 pointer-events-none" : ""
                }`}
                href={`?page=${Math.max(1, page - 1)}`}
              >
                ◀
              </Link>
              <span>
                {page} / {totalPages}
              </span>
              <Link
                aria-disabled={page >= totalPages}
                className={`h-8 w-8 grid place-items-center rounded-lg border ${
                  page >= totalPages ? "opacity-40 pointer-events-none" : ""
                }`}
                href={`?page=${Math.min(totalPages, page + 1)}`}
              >
                ▶
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
