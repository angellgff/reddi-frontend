"use client";

import PhoneIcon from "@/src/components/icons/PhoneIcon";
import OrderMapAndDriver from "./OrderMapAndDriver";

interface OrderTrackingProps {
  orderData: {
    id: number | string;
    customerName: string;
    paymentMethod: string;
  };
  // Nuevos props para mapa y repartidor
  partnerId?: string | null;
  userAddressId?: string | null;
}

export default function OrderTracking({
  orderData,
  partnerId,
  userAddressId,
}: OrderTrackingProps) {
  return (
    <div className="flex flex-col space-y-6 h-full">
      {/* SECCIÓN 1: DATOS DEL CLIENTE */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-bold text-lg">Datos del cliente</h2>
          <div className="flex gap-8 mt-4 text-sm">
            <div>
              <p className="text-gray-500 font-roboto">Nombre completo</p>
              <p className="font-medium text-gray-900">
                {orderData.customerName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-roboto">Método de pago</p>
              <p className="font-medium text-gray-900">
                {orderData.paymentMethod}
              </p>
            </div>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 bg-primary text-white font-medium py-2.5 px-4 rounded-xl text-sm hover:bg-teal-600 transition-colors">
          <PhoneIcon />
          <span>Contactar cliente</span>
        </button>
      </div>

      {/* SECCIÓN 2 y 3: Mapa + Repartidor (componente unificado) */}
      <OrderMapAndDriver
        orderId={String(orderData.id)}
        partnerId={partnerId}
        userAddressId={userAddressId}
      />
    </div>
  );
}
