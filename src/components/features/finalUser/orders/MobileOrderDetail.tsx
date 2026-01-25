"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Importamos Image
import { ChevronDown, X, Check } from "lucide-react"; // Eliminados Search y Phone
import DeliveryMap from "@/src/components/features/delivery/DeliveryMap";
import { type NormalizedOrder } from "@/src/lib/finalUser/orders/getOrderDetails";
import { getAssignedDriverForOrder } from "@/src/components/features/finalUser/orders/actions";

interface MobileOrderDetailProps {
  order: NormalizedOrder;
  route: any;
}

function currency(n: number | null | undefined) {
  const v = typeof n === "number" && isFinite(n) ? n : 0;
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  }).format(v);
}

function displayName(user: any): string {
  if (!user) return "Repartidor";
  const emailPrefix =
    typeof user.email === "string" ? user.email.split("@")[0] : "";
  const first = typeof user.first_name === "string" ? user.first_name : "";
  const last = typeof user.last_name === "string" ? user.last_name : "";
  const full = `${first} ${last}`.trim();
  return full || emailPrefix || "Repartidor";
}

function getStatusTitle(status: string) {
  switch (status) {
    case "delivered":
      return "Entregado";
    case "on_the_way":
      return "En camino";
    case "preparing":
      return "Preparando...";
    case "confirmed":
      return "Confirmado";
    case "pending":
    default:
      return "Pendiente";
  }
}

function getStatusDescription(status: string) {
  switch (status) {
    case "preparing":
      return "El restaurante está preparando tu pedido";
    case "on_the_way":
      return "Tu pedido está en camino";
    case "delivered":
      return "Tu pedido ha sido entregado";
    case "confirmed":
      return "El restaurante confirmó el pedido";
    case "pending":
    default:
      return "Esperando confirmación del restaurante";
  }
}

export default function MobileOrderDetail({
  order,
  route,
}: MobileOrderDetailProps) {
  const [driver, setDriver] = useState<any>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  useEffect(() => {
    if (order?.id) {
      getAssignedDriverForOrder(order.id).then((res) => {
        if (res.assigned) {
          setDriver(res.user);
        }
      });
    }
  }, [order?.id]);

  if (!order) return null;

  const statusLevels: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    preparing: 3,
    on_the_way: 4,
    delivered: 5,
  };

  const currentStatus = order.status || "pending";
  const currentLevel = statusLevels[currentStatus] || 1;

  return (
    <div className="relative w-full max-w-md mx-auto bg-white min-h-screen pb-10 font-sans text-black overflow-x-hidden">
      {/* Header Section */}
      <div className="relative px-4 pt-6">
        <div className="mb-6">
          <Link href="/user/home">
            <X className="w-6 h-6 text-black" />
          </Link>
        </div>

        <h1 className="text-2xl font-semibold mb-2">
          {getStatusTitle(currentStatus)}
        </h1>

        <div className="flex items-center gap-2 text-base mb-6">
          <span>Entrega estimada a las</span>
          <span className="font-semibold">10:15</span>
        </div>

        {/* Tracker */}
        <div className="flex gap-1 mb-4 h-1">
          {[1, 2, 3, 4, 5].map((level, index) => {
            const isActive = level <= currentLevel;
            const bgColor = isActive ? "bg-[#FFCF58]" : "bg-gray-200";
            const widthClass = index === 4 ? "w-[43px] flex-none" : "flex-1";

            return (
              <div
                key={level}
                className={`${widthClass} ${bgColor} rounded-full transition-colors duration-300`}
              ></div>
            );
          })}
        </div>

        <div className="text-sm font-normal mb-8">
          {getStatusDescription(currentStatus)}
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-[186px] relative px-0 mb-6">
        <div className="absolute inset-0 w-full h-full bg-gray-200">
          {order.shipments ? (
            <DeliveryMap
              shipment={order.shipments}
              forcedOrigin={route?.origin}
              forcedDestination={route?.destination}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Mapa no disponible
            </div>
          )}
        </div>
      </div>

      {/* Driver Actions */}
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[39px] h-[39px] rounded-full bg-gray-300 border-[3px] border-white overflow-hidden relative shadow-sm">
              {/* Avatar Placeholder */}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-base">
                  {driver ? displayName(driver) : "Asignando..."}
                </span>
                {driver && (
                  <div className="bg-[#47BB7E] rounded-full w-[14px] h-[14px] flex items-center justify-center p-[2px]">
                    <Check
                      className="w-full h-full text-white"
                      strokeWidth={4}
                    />
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">Reddi Delivery</div>
            </div>
          </div>

          {/* Buttons (UPDATED SECTION) */}
          <div className="flex items-center gap-4">
            <button className="w-11 h-11 bg-[#47BB7E] rounded-full flex items-center justify-center relative">
              {/* RECUERDA: Cambia el src por tu icono de Chat/Search */}
              <Image
                src="/new-design/nd-messages.png"
                alt="Chat"
                width={20}
                height={20}
                className="object-contain"
              />
            </button>
            <button className="w-[37px] h-[37px] bg-[#47BB7E] rounded-full flex items-center justify-center shadow-sm relative">
              {/* RECUERDA: Cambia el src por tu icono de Teléfono */}
              <Image
                src="/new-design/nd-phone.png"
                alt="Llamar"
                width={20}
                height={20}
                className="object-contain"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-5">
        <h2 className="text-lg font-semibold mb-1 text-black">
          Resumen de la orden
        </h2>
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-[#6B6B6B]">{order.partners?.name}</span>
          <span className="text-sm text-[#47BB7E] font-semibold cursor-pointer">
            Ver recibo
          </span>
        </div>

        {/* Items */}
        <div className="space-y-6 mb-8 relative">
          <div className="absolute left-[14px] top-4 bottom-4 w-[1px] bg-[#F6F6F6] -z-10"></div>

          {order.order_detail?.map((item, idx) => {
            const isExpanded = !!expandedItems[item.id];

            return (
              <div key={item.id} className="relative pl-12 bg-white">
                <div className="absolute left-0 top-0 w-[29px] h-[29px] bg-[#EEEEEE] rounded-md flex items-center justify-center text-sm font-semibold z-10">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-base text-black mb-1">
                    {item.products?.name}
                  </div>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="text-sm text-black cursor-pointer flex items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    {isExpanded ? "Show less" : "Show more"}{" "}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex gap-3">
                        {/* Product Image */}
                        {item.products?.image_url && (
                          <div className="h-16 w-16 relative rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                              src={item.products.image_url}
                              alt={item.products.name || "Producto"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-gray-900">
                              {item.quantity}x {item.products?.unit || "ud"}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {currency(item.unit_price * item.quantity)}
                            </span>
                          </div>

                          {/* Extras list if any */}
                          {item.extras && item.extras.length > 0 && (
                            <div className="pt-2 text-xs space-y-1 border-t border-gray-200 mt-2">
                              {item.extras.map((extra: any) => (
                                <div
                                  key={extra.id}
                                  className="flex justify-between text-gray-600"
                                >
                                  <span>
                                    + {extra.name}{" "}
                                    {extra.quantity > 1
                                      ? `(x${extra.quantity})`
                                      : ""}
                                  </span>
                                  <span>
                                    {currency(
                                      extra.unit_price * extra.quantity,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fees */}
        <div className="space-y-3 pb-4 border-b border-[#E8E8E8]">
          <div className="flex justify-between text-base font-semibold text-[#6B6B6B]">
            <span>Subtotal</span>
            <span className="text-black">{currency(order.subtotal)}</span>
          </div>
          {order.discount_amount ? (
            <div className="flex justify-between text-base font-semibold text-[#6B6B6B]">
              <span>Promotion</span>
              <span className="text-[#04BD88]">
                {currency(-order.discount_amount)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-semibold text-[#6B6B6B]">
            <span>Delivery fee</span>
            <span className="text-black">{currency(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-[#6B6B6B]">
            <span>Impuestos & Otros cargos</span>
            <span className="text-black">{currency(order.tip_amount)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between text-base font-medium mt-4 mb-8">
          <span>Total</span>
          <span className="font-semibold">{currency(order.total_amount)}</span>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-black leading-relaxed">
          Si no te encuentras disponible cuando llegue el repartidor, tu pedido
          será dejado en la puerta. Al realizar tu pedido, aceptas asumir total
          responsabilidad del mismo una vez haya sido entregado.
        </p>
      </div>
    </div>
  );
}
