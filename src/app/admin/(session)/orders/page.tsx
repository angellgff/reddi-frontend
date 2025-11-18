import OrdersTableServer from "../../../../components/features/admin/orders/OrdersTableServer";
import OrdersFilters from "../../../../components/features/admin/orders/OrdersFilters";

export default function AdminOrdersPage(props: any) {
  const { searchParams } = props;
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
        <OrdersTableServer searchParams={searchParams} />
      </div>
    </div>
  );
}
