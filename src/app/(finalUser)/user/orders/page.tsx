import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { isActiveOrderStatus } from "@/src/lib/partner/dashboard/utils/orderStatus";
import { formatCurrency } from "@/src/lib/utils";
import { CURRENCY_SYMBOL } from "@/src/lib/constants";

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

// 1. Cambiamos la firma de la función para que acepte `props` como una promesa.
export default async function OrdersHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // 2. Usamos `await` para resolver la promesa y obtener el objeto de props.
  const resolvedParams = await searchParams;

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

  // 3. A partir de aquí, el resto del código funciona igual porque `searchParams` ya es un objeto normal.
  const page = Math.max(1, Number(resolvedParams?.page ?? 1) || 1);
  const pageSize = 5; // muestra 5 por página como en el mock
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch orders with partner info
  const query = supabase
    .from("orders")
    .select(
      "id, created_at, status, total_amount, partner_id, partners:partner_id(id, name, image_url, address)",
      { count: "exact" },
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

  // Logic to split items for Mobile View
  const now = new Date();
  const weekItems: OrderListItem[] = [];
  const monthItems: OrderListItem[] = [];
  const olderItems: OrderListItem[] = [];

  items.forEach((item) => {
    const d = new Date(item.created_at);
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      weekItems.push(item);
    } else if (diffDays <= 30) {
      monthItems.push(item);
    } else {
      olderItems.push(item);
    }
  });

  const MobileOrderCard = ({ item }: { item: OrderListItem }) => (
    <div className="flex flex-col gap-3 bg-white rounded-2xl p-3 shadow-sm mb-4">
      <div className="flex gap-4">
        <div className="relative w-[119px] h-[75px] bg-[#F6F6F6] rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
          {item.partner?.image_url ? (
            <Image
              src={item.partner.image_url}
              alt={item.partner.name ?? "Tienda"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
              Logo
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-1">
          <h3 className="text-base font-bold text-black leading-tight">
            {item.partner?.name ?? "Tienda"}
          </h3>
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold text-black">4.8</span>
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-[#606060] font-semibold">(254)</span>
          </div>
          <div className="text-xs font-semibold text-[#6A6C71]">
            {formatCurrency(item.total_amount)}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-1">
        <Link
          href={`/user/orders/${item.id}`}
          className="flex-1 bg-white border border-gray-100 hover:bg-gray-50 rounded-md py-2 text-center text-sm font-medium text-[#202124] shadow-sm flex items-center justify-center gap-2"
        >
          Ver detalle
        </Link>
        <Link
          href={
            item.partner?.id
              ? `/user/stores/${item.partner.id}`
              : "/user/stores"
          }
          className="flex-1 bg-[#47BB7E] hover:bg-[#3ea870] rounded-md py-2 text-center text-sm font-medium text-white shadow-sm flex items-center justify-center gap-2"
        >
          Pedir otra vez
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="flex flex-col justify-center items-start px-4 sm:px-6 lg:px-12 py-6 sm:py-8 gap-3 bg-white">
          <h1 className="text-xl sm:text-2xl font-bold">
            Historial de pedidos
          </h1>
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
                    <div className="h-[74px] w-[126px] sm:h-[66px] sm:w-[66px] flex-shrink-0 overflow-hidden rounded-xl border border-[#D9DCE3] bg-[#F0F2F5]">
                      {it.partner?.image_url ? (
                        <Image
                          src={it.partner.image_url}
                          alt={it.partner?.name ?? "Tienda"}
                          width={126}
                          height={74}
                          className="object-contain sm:object-cover h-full w-full"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[#9BA1AE]">
                          Logo
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
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
                        <span>{CURRENCY_SYMBOL}0 envío</span>
                      </div>
                      <div className="text-[11px] text-[#0F766E]">
                        {formatCurrency(it.total_amount)}
                      </div>
                    </div>
                  </div>

                  {/* right: actions */}
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

      {/* Mobile View */}
      <div className="md:hidden w-full min-h-screen relative pt-[120px] px-6 bg-transparent pb-32">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="relative w-[22px] h-[27px]">
            <Image
              src="/new-design/nd-orders.png"
              fill
              alt="Orders"
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-black font-open-sans">
            Historial de órdenes
          </h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 relative z-10 pb-10">
          {weekItems.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-black font-open-sans">
                Esta Semana
              </h2>
              {weekItems.map((item) => (
                <MobileOrderCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {monthItems.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-black font-open-sans">
                Este Mes
              </h2>
              {monthItems.map((item) => (
                <MobileOrderCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {olderItems.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-black font-open-sans">
                Anteriores
              </h2>
              {olderItems.map((item) => (
                <MobileOrderCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {items.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No se encontraron órdenes
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-4 text-black">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}`}
                  className="px-4 py-2 bg-white rounded-lg shadow text-sm"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?page=${page + 1}`}
                  className="px-4 py-2 bg-white rounded-lg shadow text-sm"
                >
                  Siguiente
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
