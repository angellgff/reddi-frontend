"use client";

import Image from "next/image";
import { useState } from "react";
import { Phone, MessageSquare, ChevronDown, Check } from "lucide-react";
import OrderDetailRouteMap from "./OrderDetailRouteMap";
import DeliveryCollectionModal from "@/src/components/features/repartidor/delivery/DeliveryCollectionModal";
import { OrderDetailData } from "@/src/lib/repartidor/order/getOrderDetail";
import { cn } from "@/src/lib/utils";

interface Props {
  data: OrderDetailData;
}

export default function OrderDetailCard({ data }: Props) {
  const [collectionOpen, setCollectionOpen] = useState(false);

  // Fallback if data is null (should normally be handled by parent suspense)
  if (!data)
    return (
      <div className="p-4 text-center">Cargando información del pedido...</div>
    );

  // Visual logic: "Entregando" counts as Step 2 (En Camino), otherwise Step 1 (Recogiendo)
  const isPickUp = data.statusLabel === "Recogiendo";
  const isOnWay =
    data.statusLabel === "Entregando" || data.statusLabel === "En camino";
  const statusStep = isOnWay ? 2 : 1;

  const handleContact = (type: "phone" | "message") => {
    if (type === "phone" && data.customerPhone) {
      window.location.href = `tel:${data.customerPhone}`;
    }
    // Message logic would go here
  };

  return (
    <div className="w-full max-w-[390px] mx-auto bg-white min-h-screen relative font-openSans pb-24 top-0 left-0 right-0 absolute">
      {/* 1. MAP HEADER AREA */}
      <div className="relative w-full h-[250px] bg-gray-200">
        <OrderDetailRouteMap
          origin={data.originCoords}
          destination={data.destinationCoords}
          driverLocation={null} // TODO: Plug in real driver location if available
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />

        {/* Back Button (Assuming parent page handles back, or we add absolute back here) */}
        {/* <div className="absolute top-4 left-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
           <ArrowLeftIcon />
        </div> */}

        {/* Title Overlay: "Shibuya -> GV#273" */}
        <div className="absolute bottom-4 left-0 right-0 px-4 text-white">
          <div className="text-center text-[11px] font-bold mb-1 uppercase tracking-wide">
            Delivery en curso
          </div>
          <div className="flex items-center justify-center gap-2 text-[20px] font-bold leading-tight drop-shadow-md">
            <span>{data.restaurantName}</span>
            <span className="text-white/80">→</span>
            <span>{data.deliverySector || "Sector"}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT BODY */}
      <div className="relative bg-white rounded-t-[24px] -mt-5 px-5 pt-4">
        {/* Status Pills */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[#D1D1D6] rounded-full transform scale-x-110" />
            <div
              className={cn(
                "relative z-10 px-6 py-2 rounded-full text-[16px] font-bold text-white transition-colors min-w-[140px] text-center",
                statusStep === 1 ? "bg-[#47BB7E]" : "bg-[#D1D1D6]",
              )}
            >
              Recogiendo
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#D1D1D6] rounded-full transform scale-x-110" />
            <div
              className={cn(
                "relative z-10 px-6 py-2 rounded-full text-[16px] font-bold text-white transition-colors min-w-[140px] text-center",
                statusStep === 2 ? "bg-[#47BB7E]" : "bg-[#D1D1D6]",
              )}
            >
              En Camino
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-black mb-1">
              Contacta a {data.customerName.split(" ")[0]}
            </h2>
            <div className="text-[12px] font-semibold text-[#505050] flex gap-1">
              <span>Entregar Antes de las</span>
              <span className="font-bold">{data.eta}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleContact("message")}
              disabled={!data.canContact}
              className="w-[40px] h-[40px] rounded-full bg-[#47BB7E] flex items-center justify-center text-white shadow-sm disabled:opacity-50 transition-opacity"
            >
              <MessageSquare
                size={20}
                fill="currentColor"
                className="text-white"
              />
            </button>
            <button
              onClick={() => handleContact("phone")}
              disabled={!data.canContact}
              className="w-[40px] h-[40px] rounded-full bg-[#47BB7E] flex items-center justify-center text-white shadow-sm disabled:opacity-50 transition-opacity"
            >
              <Phone size={20} fill="currentColor" className="text-white" />
            </button>
          </div>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* Address Details */}
        <div className="mb-6">
          <div className="flex gap-8 mb-4">
            <div>
              <p className="text-[15px] font-semibold text-[#878787] mb-1">
                Apt / Room
              </p>
              <p className="text-[16px] font-bold text-black">
                {data.deliveryAddress || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#878787] mb-1">
                Sector & #
              </p>
              <p className="text-[16px] font-bold text-black">
                {data.deliverySector || "GV #123"}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[15px] font-semibold text-[#878787] mb-2">
              Instrucciones de el Cliente
            </p>
            <div className="inline-flex items-center bg-[#DADADA] rounded-full px-4 py-2">
              <span className="text-[13px] font-bold text-black">
                {data.deliveryInstructions || "Dejar en la puerta"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[15px] font-bold text-[#878787] mb-1">
              Nota de el cliente
            </p>
            <p className="text-[14px] text-black leading-snug font-semibold">
              {data.customerNote ||
                "Toca la puerta o el timbre. Dejalo frente al banco."}
            </p>
          </div>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* Order Summary */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[18px] font-semibold text-black">
                Resumen de la orden
              </h3>
              <span className="text-[14px] text-[#6B6B6B]">
                {data.restaurantName}
              </span>
            </div>
            <button className="text-[14px] font-semibold text-[#47BB7E]">
              Ver recibo
            </button>
          </div>

          <div className="space-y-4">
            {data.items &&
              data.items.map((item, idx) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="w-[29px] h-[29px] flex-shrink-0 bg-[#EEEEEE] rounded-[6px] flex items-center justify-center">
                    <span className="text-[14px] font-semibold text-black">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 border-b border-gray-100 pb-2">
                    <p className="text-[16px] text-black leading-tight mb-1">
                      {item.name}
                    </p>
                    {item.variantName && (
                      <p className="text-[13px] text-gray-500 mb-1">
                        {item.variantName}
                      </p>
                    )}

                    {/* Show More (Visual only for now) */}
                    <button className="flex items-center gap-1 text-[14px] text-black mt-1 font-normal">
                      Show more <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-between items-center mt-8 border-t border-gray-100 pt-4">
            <span className="text-[16px] text-black font-normal">Total</span>
            <span className="text-[16px] text-black font-normal">
              RD${data.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS (Delivery Button) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 z-50">
        <button
          onClick={() => setCollectionOpen(true)}
          disabled={!data.canMarkDelivered && !data.canAccept}
          className="w-full h-[50px] bg-[#47BB7E] rounded-full text-white font-bold text-[18px] shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#3ca56e] transition-colors"
        >
          {data.canMarkDelivered ? "Confirmar Entrega" : "Acciones"}
        </button>
      </div>

      <DeliveryCollectionModal
        isOpen={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        onSuccess={() => {
          setCollectionOpen(false);
          window.location.href = "/repartidor/home";
        }}
        orderId={data.id}
        driverId={data.shipmentDriverId || ""}
        totalAmount={data.totalAmount}
        initialMethod={data.paymentMethod || "cash"}
      />
    </div>
  );
}
