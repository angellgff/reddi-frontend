"use client";

import { useState, useEffect } from "react";
import { Phone, MessageSquare, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import OrderDetailRouteMap from "./OrderDetailRouteMap";
import DriverFloatingBar from "./DriverFloatingBar";
import DeliveryCollectionModal from "@/src/components/features/repartidor/delivery/DeliveryCollectionModal";
import { OrderDetailData } from "@/src/lib/repartidor/order/getOrderDetail";
import { updateShipmentStatusAction } from "@/src/lib/actions/delivery";
import { cn } from "@/src/lib/utils";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import Link from "next/link";

interface Props {
  data: OrderDetailData;
}

export default function OrderDetailCard({ data }: Props) {
  const router = useRouter();
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [floatingMode, setFloatingMode] = useState<
    "see_route" | "proceed_pay" | "slide_complete" | null
  >(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // UseEffect to determine mode only on client side to avoid Hydration Mismatch
  useEffect(() => {
    if (!data) return;
    const sStatus = data.shipmentStatus;
    const pStatus = data.paymentStatus;
    const isCash = data.paymentMethod === "cash";
    const isPhysicalPos = data.paymentMethod === "physical_pos";
    const isPaid = pStatus === "completed";

    console.log("[OrderDetailCard] DEBUG MODE:", {
      sStatus,
      pStatus,
      paymentMethod: data.paymentMethod,
      isCash,
      isPhysicalPos,
      isPaid,
    });

    let mode: "see_route" | "proceed_pay" | "slide_complete" | null = null;

    if (
      sStatus === "en_route_to_pickup" ||
      sStatus === "driver_assigned" ||
      sStatus === "pending_calculation" ||
      sStatus === "ready_for_pickup"
    ) {
      mode = "see_route";
    } else if (
      sStatus === "en_route_to_delivery" ||
      sStatus === "at_partner" ||
      sStatus === "at_destination" ||
      sStatus === "delivering"
    ) {
      // Si estamos en camino o entregando, mostrar botón de cobro/entrega
      if ((isCash || isPhysicalPos) && !isPaid) {
        mode = "proceed_pay";
      } else {
        mode = "slide_complete";
      }
    } else {
      // Fallback: si no cuadra el status, pero el pedido está asignado y activo,
      // intentar mostrar Slide si ya pasó la etapa de pickup.
      // O mostrar See Route por defecto.
      mode = "see_route";
    }
    setFloatingMode(mode);
  }, [data]);

  // Fallback if data is null
  if (!data)
    return (
      <div className="p-4 text-center">Cargando información del pedido...</div>
    );

  // Visual logic
  const sStatus = data.shipmentStatus;

  const isRecogiendoActive =
    sStatus === "driver_assigned" ||
    sStatus === "en_route_to_pickup" ||
    sStatus === "at_partner" ||
    sStatus === "ready_for_pickup";

  const isEnCaminoActive =
    sStatus === "en_route_to_delivery" ||
    sStatus === "delivering" ||
    sStatus === "at_destination";

  const handleStatusChange = async (newStatus: string) => {
    if (statusLoading || !data.shipmentId) return;
    setStatusLoading(true);
    try {
      const res = await updateShipmentStatusAction(data.shipmentId, newStatus);
      if (res.success) {
        router.refresh();
      } else {
        console.error("Error updating status:", res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleContact = (type: "phone" | "message") => {
    if (type === "phone" && data.customerPhone) {
      // Uso estándar de protocolo tel: funciona en móviles iniciando la llamada
      window.location.href = `tel:${data.customerPhone}`;
    }
    if (type === "message") {
      // Navegación al chat interno de la app
      router.push(`/repartidor/orders/${data.id}/chat`);
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
          <div className="flex-1 text-center pr-10">
            {" "}
            {/* pr-10 to balance the back button */}
            <span className="text-[12px] font-bold uppercase tracking-wide text-black block">
              Delivery en curso
            </span>
            <h1 className="text-[18px] font-bold text-black flex items-center justify-center gap-1 mt-1">
              {data.restaurantName} <span className="text-gray-400">→</span>{" "}
              {data.deliverySector || "Sector"}
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
          <button
            onClick={() => handleStatusChange("en_route_to_pickup")}
            className="flex-1 h-[40px]"
            disabled={statusLoading || isRecogiendoActive} // Disable if already active
          >
            <div
              className={cn(
                "w-full h-full flex items-center justify-center rounded-full font-bold text-[15px] transition-colors",
                isRecogiendoActive
                  ? "bg-[#47BB7E] text-white"
                  : "bg-[#D1D1D6] text-white hover:bg-gray-400",
              )}
            >
              Recogiendo
            </div>
          </button>

          <button
            onClick={() => handleStatusChange("en_route_to_delivery")}
            className="flex-1 h-[40px]"
            disabled={statusLoading || isEnCaminoActive} // Disable if already active
          >
            <div
              className={cn(
                "w-full h-full flex items-center justify-center rounded-full font-bold text-[15px] transition-colors",
                isEnCaminoActive
                  ? "bg-[#47BB7E] text-white"
                  : "bg-[#D1D1D6] text-white hover:bg-gray-400",
              )}
            >
              En Camino
            </div>
          </button>
        </div>

        <div className="h-[1px] bg-gray-100 w-full" />

        {/* Address Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          {/* Apt / Room */}
          <div>
            <p className="text-[14px] font-semibold text-[#878787] mb-1">
              Apt / Room
            </p>
            <p className="text-[16px] font-bold text-black">
              {data.deliveryAddress || "N/A"}
            </p>
          </div>

          {/* Sector & # */}
          <div>
            <p className="text-[14px] font-semibold text-[#878787] mb-1">
              Sector & #
            </p>
            <p className="text-[16px] font-bold text-black">
              {data.deliverySector || "N/A"}
            </p>
          </div>

          {/* Instructions */}
          <div className="col-span-2">
            <p className="text-[14px] font-semibold text-[#878787] mb-2">
              Instrucciones de el Cliente
            </p>
            <div className="inline-flex bg-[#E5E7EB] rounded-full px-5 py-2">
              <span className="text-[14px] font-bold text-black">
                {data.deliveryInstructions || "Dejar en la puerta"}
              </span>
            </div>
          </div>

          {/* Customer Note */}
          <div className="col-span-2">
            <p className="text-[15px] font-bold text-[#878787] mb-1">
              Nota de el cliente
            </p>
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
              <h3 className="text-[18px] font-bold text-black">
                Resumen de la orden
              </h3>
              <p className="text-[14px] text-[#6B6B6B] mt-1">
                {data.restaurantName}
              </p>
            </div>
            <button className="text-[14px] font-semibold text-[#47BB7E] mb-1">
              Ver recibo
            </button>
          </div>

          <div className="space-y-4">
            {data.items &&
              data.items.map((item, idx) => {
                const isExpanded = !!expandedItems[item.id];
                return (
                  <div key={item.id} className="flex gap-4 items-start">
                    {/* Number Badge */}
                    <div className="w-[30px] h-[30px] bg-[#EEEEEE] rounded-[6px] flex items-center justify-center shrink-0">
                      <span className="text-[14px] font-bold text-black">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[16px] text-black font-normal mb-1">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-[14px] text-gray-600 font-semibold">
                          RD${item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Botón Show more / Show less */}
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="flex items-center gap-1 text-[13px] text-black font-medium mt-1"
                      >
                        {isExpanded ? "Show less" : "Show more"}{" "}
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform",
                            isExpanded ? "rotate-180" : "",
                          )}
                        />
                      </button>

                      {/* Detalles Expandidos */}
                      {isExpanded && (
                        <div className="mt-2 pl-2 border-l-2 border-gray-200 text-sm text-gray-600">
                          {item.variantName && (
                            <p className="mb-1">
                              <span className="font-semibold">Variantes:</span>{" "}
                              {item.variantName}
                            </p>
                          )}
                          {!item.variantName && (
                            <p className="italic text-gray-400">
                              Sin detalles adicionales
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mt-6">
            <span className="text-[16px] text-black font-normal">Total</span>
            <span className="text-[16px] text-black font-normal">
              RD${data.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS (Floating Bar) */}
      {/* FOOTER ACTIONS (Floating Bar) */}
      {floatingMode && (
        <DriverFloatingBar
          mode={floatingMode}
          amount={data.totalAmount}
          onAction={() => {
            const sStatus = data.shipmentStatus;
            if (floatingMode === "see_route") {
              const isPickingUp =
                sStatus === "en_route_to_pickup" ||
                sStatus === "driver_assigned" ||
                sStatus === "ready_for_pickup";
              const targetFn = isPickingUp
                ? data.originCoords
                : data.destinationCoords;
              if (targetFn) {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${targetFn[1]},${targetFn[0]}`;
                window.open(url, "_blank");
              }
              return;
            }
            setCollectionOpen(true);
          }}
          disabled={
            !data.canMarkDelivered &&
            !data.canAccept &&
            floatingMode !== "see_route"
          }
        />
      )}

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

      {/* Full Screen Loader */}
      {statusLoading && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white px-6 py-4 rounded-xl shadow-2xl flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#47BB7E]" />
            <span className="text-gray-800 font-bold text-sm">
              Actualizando estado...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
