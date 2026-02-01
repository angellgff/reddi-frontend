"use client";

import { useState } from "react";
import { Phone, MessageSquare, ChevronDown } from "lucide-react";
import OrderDetailRouteMap from "./OrderDetailRouteMap";
import DeliveryCollectionModal from "@/src/components/features/repartidor/delivery/DeliveryCollectionModal";
import { OrderDetailData } from "@/src/lib/repartidor/order/getOrderDetail";
import { cn } from "@/src/lib/utils";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import Link from "next/link";

interface Props {
  data: OrderDetailData;
}

export default function OrderDetailCard({ data }: Props) {
  const [collectionOpen, setCollectionOpen] = useState(false);

  // Fallback if data is null
  if (!data)
    return (
      <div className="p-4 text-center">Cargando información del pedido...</div>
    );

  // Visual logic
  const isOnWay =
    data.statusLabel === "Entregando" || data.statusLabel === "En camino";
  const statusStep = isOnWay ? 2 : 1;

  const handleContact = (type: "phone" | "message") => {
    if (type === "phone" && data.customerPhone) {
      window.location.href = `tel:${data.customerPhone}`;
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto min-h-screen bg-white pb-32 flex flex-col">
      {/* 1. HEADER (Standard Block) */}
      <div className="px-4 pt-6 pb-2 bg-white">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/repartidor/home"
            className="w-10 h-10 bg-[#F6F6F6] rounded-full flex items-center justify-center"
          >
            <ArrowLeftIcon />
          </Link>
          <div className="flex-1 text-center pr-10"> {/* pr-10 to balance the back button */}
             <span className="text-[12px] font-bold uppercase tracking-wide text-black block">
              Delivery en curso
            </span>
             <h1 className="text-[18px] font-bold text-black flex items-center justify-center gap-1 mt-1">
              {data.restaurantName} <span className="text-gray-400">→</span> {data.deliverySector || "Sector"}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. MAP (Standard Block) */}
      <div className="w-full h-[220px] bg-gray-200">
        <OrderDetailRouteMap
          origin={data.originCoords}
          destination={data.destinationCoords}
          driverLocation={null} 
        />
      </div>

      {/* 3. CONTENT BODY (Standard Block) */}
      <div className="px-6 py-6 flex flex-col gap-6">
        
        {/* Contact Section */}
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-[18px] font-bold text-black leading-tight">
                    Contacta a {data.customerName.split(" ")[0]}
                </h2>
                <div className="text-[13px] text-[#505050] flex gap-1 mt-1">
                    <span className="font-semibold">Entregar Antes de las</span>
                    <span className="font-bold">{data.eta}</span>
                </div>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={() => handleContact("message")}
                    disabled={!data.canContact}
                    className="w-[45px] h-[45px] rounded-full bg-[#47BB7E] flex items-center justify-center text-white shadow-sm disabled:opacity-50 hover:bg-[#3ca56e] transition-colors"
                >
                    <MessageSquare size={22} fill="currentColor" />
                </button>
                <button
                    onClick={() => handleContact("phone")}
                    disabled={!data.canContact}
                    className="w-[45px] h-[45px] rounded-full bg-[#47BB7E] flex items-center justify-center text-white shadow-sm disabled:opacity-50 hover:bg-[#3ca56e] transition-colors"
                >
                     <Phone size={22} fill="currentColor" />
                </button>
            </div>
        </div>

        {/* Status Pills */}
        <div className="flex justify-center items-center gap-2 w-full">
           <div 
             className={cn(
               "h-[40px] rounded-full flex items-center justify-center font-bold text-[15px] text-white flex-1 transition-colors duration-300",
               statusStep === 1 ? "bg-[#d1d5db]" : "bg-[#d1d5db]" // "Recogiendo" active state logic? 
               // In screenshot: Recogiendo is grey, En Camino is green.
               // Assuming logic: If step 1, Recogiendo Green? Or maybe as per screenshot...
               // Screenshot shows: Recogiendo (Grey), En Camino (Green).
               // If data says "En Camino", then En Camino is Green. 
               // If data says "Recogiendo", Recogiendo should be Green.
             )}
           >
              {/* Fix logic for colors based on Step */}
             <div className={cn(
                  "w-full h-full flex items-center justify-center rounded-full",
                  statusStep === 1 ? "bg-[#47BB7E]" : "bg-[#D1D1D6]"
             )}>
                 Recogiendo
             </div>
           </div>

           <div className="h-[40px] flex-1">
             <div className={cn(
                  "w-full h-full flex items-center justify-center rounded-full font-bold text-[15px] text-white",
                  statusStep === 2 ? "bg-[#47BB7E]" : "bg-[#D1D1D6]"
             )}>
                En Camino
             </div>
           </div>
        </div>

        <div className="h-[1px] bg-gray-100 w-full" />

        {/* Address Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            {/* Apt / Room */}
            <div>
                <p className="text-[14px] font-semibold text-[#878787] mb-1">Apt / Room</p>
                <p className="text-[16px] font-bold text-black">{data.deliveryAddress || "N/A"}</p>
            </div>

            {/* Sector & # */}
            <div>
                <p className="text-[14px] font-semibold text-[#878787] mb-1">Sector & #</p>
                <p className="text-[16px] font-bold text-black">{data.deliverySector || "N/A"}</p>
            </div>

            {/* Instructions */}
            <div className="col-span-2">
                <p className="text-[14px] font-semibold text-[#878787] mb-2">Instrucciones de el Cliente</p>
                <div className="inline-flex bg-[#E5E7EB] rounded-full px-5 py-2">
                    <span className="text-[14px] font-bold text-black">{data.deliveryInstructions || "Dejar en la puerta"}</span>
                </div>
            </div>

            {/* Customer Note */}
             <div className="col-span-2">
                <p className="text-[15px] font-bold text-[#878787] mb-1">Nota de el cliente</p>
                <p className="text-[14px] font-semibold text-black leading-snug">
                    {data.customerNote || "Sin notas adicionales."}
                </p>
            </div>
        </div>
        
        <div className="h-[8px] bg-[#F6F6F6] w-[calc(100%+3rem)] -mx-6" />

        {/* Order Summary */}
        <div>
             <div className="flex justify-between items-end mb-4">
                <div>
                     <h3 className="text-[18px] font-bold text-black">Resumen de la orden</h3>
                     <p className="text-[14px] text-[#6B6B6B] mt-1">{data.restaurantName}</p>
                </div>
                <button className="text-[14px] font-semibold text-[#47BB7E] mb-1">Ver recibo</button>
             </div>

             <div className="space-y-4">
                {data.items && data.items.map((item, idx) => (
                    <div key={item.id} className="flex gap-4 items-start">
                        {/* Number Badge */}
                        <div className="w-[30px] h-[30px] bg-[#EEEEEE] rounded-[6px] flex items-center justify-center shrink-0">
                            <span className="text-[14px] font-bold text-black">{idx + 1}</span>
                        </div>
                        
                        {/* Item Details */}
                        <div className="flex-1">
                            <p className="text-[16px] text-black font-normal mb-1">{item.name}</p>
                            <button className="flex items-center gap-1 text-[13px] text-black font-medium">
                                Show more <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>
                ))}
             </div>
             
             {/* Total */}
             <div className="flex justify-between items-center mt-6">
                  <span className="text-[16px] text-black font-normal">Total</span>
                  <span className="text-[16px] text-black font-normal">RD${data.totalAmount.toFixed(2)}</span>
             </div>
        </div>

      </div>

      {/* FOOTER ACTIONS */}
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
