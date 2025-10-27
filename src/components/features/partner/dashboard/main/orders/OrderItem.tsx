// components/features/dashboard/OrderItem.tsx
import type { Order, OrderStatus } from "@/src/lib/partner/dashboard/type";

const statusStyles: Record<OrderStatus, string> = {
  Preparando: "bg-yellow-100 text-yellow-800",
  Listo: "bg-green-100 text-green-800",
  Nuevo: "bg-red-100 text-red-800",
  "En camino": "bg-blue-100 text-blue-800",
};

export default function OrderItem({ order }: { order: Order }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-[#E5E7EB] last:border-b-0 px-4">
      <div className="flex items-center gap-4">
        <span className="bg-[#E5E7EB] text-[#2563EB] font-mono text-sm font-semibold w-9 h-9 flex items-center justify-center rounded-lg"></span>
        <div>
          <h4 className="font-medium text-gray-800">{order.name}</h4>
          <p className="text-sm text-gray-500 font-thin">{order.details}</p>
        </div>
      </div>
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${
          statusStyles[order.status]
        }`}
      >
        {order.status}
      </span>
    </div>
  );
}
