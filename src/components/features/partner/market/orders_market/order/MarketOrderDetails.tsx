import Image from "next/image";
import OrderVillageIcon from "@/src/components/icons/OrderVillageIcon";
import { OrderDetails } from "@/src/lib/partner/orders/getOrderDetailsData";
import OrderStatusControls from "@/src/components/features/partner/market/orders/order/OrderStatusControls";

interface MarketOrderDetailsProps {
  order: OrderDetails;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export default function MarketOrderDetails({ order }: MarketOrderDetailsProps) {
  const subtotal = order.subtotal;
  const total = order.total;

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-lg">Detalles del pedido</h2>
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
          <Image
            src={order.store.logoUrl}
            alt={`Logo de ${order.store.name}`}
            fill={true}
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-medium">{order.store.name}</p>
          <p className="text-sm font-roboto text-gray-500">
            Tiempo estimado: {order.estimatedTime}
          </p>
        </div>
      </div>
      <div className="my-6 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill={true}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium ">{item.name}</p>
                  <p className="text-sm font-roboto text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
              <p>
                <span className="font-semibold font-inter">
                  {formatPrice(item.price)}
                </span>
                <span> USD</span>
              </p>
            </div>
            {item.extras && item.extras.length > 0 && (
              <div className="ml-24 mt-2 space-y-1">
                {item.extras.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between text-sm text-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      {ex.imageUrl ? (
                        <div className="h-6 w-6 rounded bg-gray-200 overflow-hidden relative">
                          <Image
                            src={ex.imageUrl}
                            alt={ex.name ?? "extra"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded bg-gray-100" />
                      )}
                      <span>
                        + {ex.name ?? "Extra"}
                        {ex.quantity > 1 ? ` x${ex.quantity}` : ""}
                      </span>
                    </div>
                    <span className="text-gray-900">
                      {formatPrice(ex.unit_price * ex.quantity)} USD
                    </span>
                  </div>
                ))}
              </div>
            )}
            <hr className="border-[#D9DCE3]" />
          </div>
        ))}
      </div>
      <hr className="border-[#D9DCE3]" />
      <div className="my-4 space-y-2 text-sm font-roboto">
        <div className="flex justify-between text-gray-600">
          <p>Subtotal</p>
          <p>{formatPrice(subtotal)} USD</p>
        </div>
        <div className="flex justify-between text-gray-600">
          <p>Envío</p>
          <p>{formatPrice(order.costs.delivery)} USD</p>
        </div>
        <div className="flex justify-between text-gray-600">
          <p>Propina</p>
          <p>{formatPrice(order.costs.tip)} USD</p>
        </div>
        {order.costs.discount > 0 && (
          <div className="flex justify-between text-gray-600">
            <p>Descuento</p>
            <p>-{formatPrice(order.costs.discount)} USD</p>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <p>Impuestos</p>
          <p>{formatPrice(order.costs.taxes)} USD</p>
        </div>
      </div>
      <hr className="border-[#D9DCE3]" />
      <div className="flex justify-between items-center my-4  font-inter">
        <p className="text-lg font-bold">Total</p>
        <p className="text-lg font-bold">{formatPrice(total)}</p>
      </div>
      <OrderStatusControls
        orderId={order.orderId}
        initialStatus={order.status}
      />
      <div className="bg-black text-white p-4 rounded-2xl flex items-center gap-4">
        <div className="bg-[#292929] p-3 rounded-lg flex-shrink-0">
          <OrderVillageIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className="font-medium text-primary">{order.address.title}</p>
          <p className="text-sm font-roboto">{order.address.details}</p>
          {order.instructions && (
            <p className="text-xs mt-1 opacity-80">{order.instructions}</p>
          )}
        </div>
      </div>
    </div>
  );
}
