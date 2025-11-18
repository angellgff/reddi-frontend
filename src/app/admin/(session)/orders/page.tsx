import OrdersTableServer from "../../../../components/features/admin/orders/OrdersTableServer";
import OrdersFilters from "../../../../components/features/admin/orders/OrdersFilters";

// 1. La función del componente ahora es 'async'
export default async function AdminOrdersPage({
  searchParams,
}: {
  // 2. El tipo de 'searchParams' se define como una Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // 3. Se resuelve la promesa para obtener el objeto de searchParams
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-[#F0F2F5]/90 p-6 md:p-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[24px] leading-7 font-semibold text-[#171717]">
          Gestión de pedidos
        </h1>
        <p className="text-[18px] leading-6 text-black/90 mt-1">
          Aquí está el resumen de hoy
        </p>
      </div>

      {/* Filters card */}
      <div className="rounded-2xl bg-white p-5 md:p-6 mb-6 shadow-sm border border-[#D9DCE3]">
        <div className="text-[18px] font-semibold text-[#1F2937] mb-4">
          Filtros
        </div>
        <OrdersFilters />
      </div>

      {/* Orders table card */}
      <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[#1F2937]">
            Lista de Pedidos
          </h2>
        </div>
        {/* 4. Se pasa el objeto resuelto al componente hijo */}
        <OrdersTableServer searchParams={resolvedSearchParams} />
      </div>
    </div>
  );
}
