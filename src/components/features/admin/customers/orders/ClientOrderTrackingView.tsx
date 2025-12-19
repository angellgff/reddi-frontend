"use client";

import MarketOrderMapAndDriver from "@/src/components/features/partner/market/orders_market/order/MarketOrderMapAndDriver";

interface ClientOrderTrackingProps {
  orderData: {
    id: number | string;
    customerName: string;
    paymentMethod: string;
  };
  partnerId?: string | null;
  userAddressId?: string | null;
}

export default function ClientOrderTrackingView({
  orderData,
  partnerId,
  userAddressId,
}: ClientOrderTrackingProps) {
  return (
    <div className="flex flex-col space-y-6 h-full">
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
        {/* Contact button removed */}
      </div>
      <MarketOrderMapAndDriver
        orderId={String(orderData.id)}
        partnerId={partnerId}
        userAddressId={userAddressId}
      />
    </div>
  );
}
