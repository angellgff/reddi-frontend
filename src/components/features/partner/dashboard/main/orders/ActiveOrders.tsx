import CardShell from "@/src/components/features/partner/CardShell";
import OrderItem from "./OrderItem";
import type { Order } from "@/src/lib/partner/dashboard/type";
import Link from "next/link";

export default function ActiveOrders({ orders }: { orders: Order[] }) {
  return (
    <CardShell>
      <div className="flex flex-col h-full">
        {/* Header con Filtro */}
        <div className="flex justify-between items-center px-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 font-roboto block">
            Pedidos Activos
          </h3>
          <div className="flex justify-end items-center">
            <label
              htmlFor="status"
              className="text-sm text-gray-600 mr-2 font-roboto"
            >
              Estado
            </label>
            <select
              id="status"
              className="border border-gray-300 rounded-full text-xs"
            >
              <option>Seleccione</option>
              <option>Nuevo</option>
              <option>Preparando</option>
              <option>Listo</option>
              <option>En camino</option>
            </select>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="overflow-y-auto h-72 border-t border-b border-[#E5E7EB]">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>

        <Link
          href="./orders"
          className="text-sm text-primary hover:text-emerald-700 mt-4 px-6"
        >
          Ver todos los pedidos {">"}
        </Link>
      </div>
    </CardShell>
  );
}
