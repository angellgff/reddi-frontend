"use client";

import OrderCard from "@/src/components/features/repartidor/home/orderSection/OrderCard";
import { OrderData } from "@/src/lib/repartidor/type";

export default function OrderCardSection({ orders }: { orders: OrderData[] }) {
  return (
    <>
      <div className="font-bold ml-6 mb-5 text-xl">
        <span className="text-primary">Pedidos</span> <span>Activos</span>
      </div>
      {orders.length === 0 ? (
        <div className="text-center text-sm text-gray-500 px-6">
          No hay pedidos activos por ahora.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.orderId} {...order} onAccept={() => {}} />
          ))}
        </div>
      )}
    </>
  );
}
