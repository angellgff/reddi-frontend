import StatCard from "@/src/components/features/partner/stats/StatCard";
import StatDollarIcon from "@/src/components/icons/StatDollarIcon";
import CompleteOrderIcon from "@/src/components/icons/CompleteOrderIcon";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/server";

type CategoryCard = {
  name: string;
  imageUrl: string;
  percent: string; // "45%"
};

// Lista fija de categorías a mostrar con sus imágenes
const CATEGORY_PRESETS: Omit<CategoryCard, "percent">[] = [
  { name: "Mercado", imageUrl: "/Market.svg" },
  { name: "Restaurantes", imageUrl: "/Restaurants.svg" },
  { name: "Mandao’", imageUrl: "/mandao.svg" },
  { name: "Alcohol", imageUrl: "/alcohol.svg" },
  { name: "Farmacia", imageUrl: "/Pharma.svg" },
  { name: "Tabaco", imageUrl: "/Tobacco.svg" },
];

type SearchParams = {
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  status?: string; // pending | preparing | delivered | cancelled ...
};

export default async function AdminFinancesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  // 1. Obtener órdenes filtradas
  let ordersQ = supabase
    .from("orders")
    .select(
      "id,total_amount,shipping_fee,status,created_at,partner:partners(partner_type)"
    );

  if (searchParams.status) {
    ordersQ = ordersQ.eq("status", searchParams.status);
  }
  if (searchParams.from) {
    ordersQ = ordersQ.gte("created_at", `${searchParams.from}T00:00:00Z`);
  }
  if (searchParams.to) {
    ordersQ = ordersQ.lte("created_at", `${searchParams.to}T23:59:59Z`);
  }

  const { data: orders, error: ordersError } = await ordersQ;

  // Calcular estadísticas básicas
  const totalSales =
    orders?.reduce((acc, o) => acc + (o.total_amount ?? 0), 0) ?? 0;
  // Asumimos comisión = shipping_fee (ajustar si existe otra lógica)
  const totalCommission =
    orders?.reduce((acc, o) => acc + (o.shipping_fee ?? 0), 0) ?? 0;
  const pendingCount =
    orders?.filter((o) => o.status === "pending").length ?? 0;

  // 2. Calcular distribución por categoría basada en partner_type
  // Mapeo partner_type -> nombre mostrado
  const partnerTypeToDisplay: Record<string, string> = {
    market: "Mercado",
    restaurant: "Restaurantes",
    liquor_store: "Alcohol",
  };

  let categoryCards: CategoryCard[] = CATEGORY_PRESETS.map((c) => ({
    ...c,
    percent: "0%",
  }));

  if (orders && orders.length > 0) {
    // Sumar total_amount por tipo de partner
    const revenueByType: Record<string, number> = {};
    let totalRevenue = 0;
    for (const o of orders as any[]) {
      const typeKey = o.partner?.partner_type as string | undefined;
      if (!typeKey) continue;
      const displayName = partnerTypeToDisplay[typeKey];
      if (!displayName) continue; // ignorar tipos no mapeados
      const amount = o.total_amount ?? 0;
      revenueByType[displayName] = (revenueByType[displayName] || 0) + amount;
      totalRevenue += amount;
    }

    if (totalRevenue > 0) {
      categoryCards = CATEGORY_PRESETS.map((c) => {
        const value = revenueByType[c.name] || 0;
        const pct = Math.round((value / totalRevenue) * 100);
        return { ...c, percent: `${pct}%` };
      });
    }
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className="w-full max-w-[1217px] mx-auto px-8 py-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-[24px] leading-[28px] font-semibold text-[#171717]">
          Finanzas
        </h1>
        <p className="text-[18px] leading-6 text-black">
          Gestiona las finanzas y transferencias de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <StatCard title="Ventas Totales" value={formatCurrency(totalSales)}>
          <StatDollarIcon />
        </StatCard>
        <StatCard title="Comisiones" value={formatCurrency(totalCommission)}>
          <StatDollarIcon />
        </StatCard>
        <StatCard title="Pendientes" value={String(pendingCount)}>
          <CompleteOrderIcon />
        </StatCard>
      </div>

      <section className="bg-white rounded-2xl p-5 mb-8">
        <h2 className="text-[#1F2937] text-lg font-semibold mb-4">Filtros</h2>
        <form
          className="flex flex-col lg:flex-row lg:items-end gap-5"
          method="get"
        >
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-[#292929] mb-2">
              Desde
            </label>
            <input
              type="date"
              name="from"
              defaultValue={searchParams.from}
              className="w-full h-10 border border-[#D9DCE3] rounded-xl px-4 text-sm bg-white"
            />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-[#292929] mb-2">
              Hasta
            </label>
            <input
              type="date"
              name="to"
              defaultValue={searchParams.to}
              className="w-full h-10 border border-[#D9DCE3] rounded-xl px-4 text-sm bg-white"
            />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-medium text-[#292929] mb-2">
              Estados
            </label>
            <select
              name="status"
              defaultValue={searchParams.status || ""}
              className="w-full h-10 border border-[#D9DCE3] rounded-xl px-4 text-sm bg-white"
            >
              <option value="">Seleccione</option>
              <option value="pending">Pendiente</option>
              <option value="preparing">Preparando</option>
              <option value="out_for_delivery">En camino</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="flex gap-3">
            <a
              href="?"
              className="h-11 px-5 rounded-xl border border-[#202124] bg-white text-[#202124] text-sm grid place-items-center"
            >
              Limpiar filtros
            </a>
            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-[#04BD88] text-white text-sm"
            >
              Filtrar
            </button>
          </div>
        </form>
        {ordersError && (
          <p className="mt-4 text-xs text-red-600">
            Error cargando órdenes: {ordersError.message}
          </p>
        )}
      </section>

      <section className="bg-white rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-[#171717] text-[18px] font-bold">
            Distribución por Categoría
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryCards.map((c) => (
            <div
              key={c.name}
              className="flex flex-col items-center justify-center p-5 gap-2 w-full h-[169px] bg-[#F0F2F5B8] rounded-2xl"
            >
              <div className="flex items-center justify-center w-[106px] h-[109px]">
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  width={c.name === "Farmacia" ? 70 : 100} // <-- CAMBIO AQUÍ
                  height={c.name === "Farmacia" ? 70 : 100} // <-- Y AQUÍ
                  className="object-contain"
                />
              </div>
              <span className="text-[16px] leading-5 font-medium text-black text-center">
                {c.name}
              </span>
              <span className="text-[24px] leading-8 font-bold text-black text-center">
                {c.percent}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
