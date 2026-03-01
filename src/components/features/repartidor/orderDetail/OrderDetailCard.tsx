"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Info, MessageCircle, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import OrderDetailRouteMap from "./OrderDetailRouteMap";
import DriverFloatingBar from "./DriverFloatingBar";
import DeliveryCollectionModal from "@/src/components/features/repartidor/delivery/DeliveryCollectionModal";
import { OrderDetailData } from "@/src/lib/repartidor/order/getOrderDetail";
import {
  confirmDeliveryPinAction,
  updateShipmentStatusAction,
} from "@/src/lib/actions/delivery";
import { cn } from "@/src/lib/utils";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

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
  const [pinInput, setPinInput] = useState("");
  const [pinConfirming, setPinConfirming] = useState(false);
  const [pinConfirmed, setPinConfirmed] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinErrorModalOpen, setPinErrorModalOpen] = useState(false);
  const [pinErrorModalMessage, setPinErrorModalMessage] = useState<string>("");

  const formattedEta = useMemo(() => {
    const eta = data?.eta ?? "";
    if (/^\d{2}:\d{2}$/.test(eta)) return eta;
    const min = Number((eta.match(/(\d+)/)?.[1] ?? "5").trim());
    const safeMin = Number.isFinite(min) ? min : 5;
    return `${String(safeMin).padStart(2, "0")}:01`;
  }, [data?.eta]);

  const formatDOP = (value: number) => {
    return `RD$${(value || 0).toFixed(2)}`;
  };

  useEffect(() => {
    if (!data) return;

    const sStatus = data.shipmentStatus;
    const pStatus = data.paymentStatus;
    const isCash = data.paymentMethod === "cash";
    const isPhysicalPos = data.paymentMethod === "physical_pos";
    const isPaid = pStatus === "completed";

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
      if ((isCash || isPhysicalPos) && !isPaid) {
        mode = "proceed_pay";
      } else {
        mode = "slide_complete";
      }
    } else {
      mode = "see_route";
    }

    setFloatingMode(mode);
  }, [data]);

  useEffect(() => {
    setPinInput("");
    setPinError(null);
    setPinConfirmed(false);
    setPinConfirming(false);
  }, [data.id]);

  if (!data) {
    return (
      <div className="p-4 text-center">Cargando información del pedido...</div>
    );
  }

  const sStatus = data.shipmentStatus;
  const isOrderFinalized =
    sStatus === "delivered" || data.orderStatus === "delivered";

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
    } catch (error) {
      console.error(error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleContact = () => {
    router.push(`/repartidor/orders/${data.id}/chat`);
  };

  const handleConfirmPin = async () => {
    if (isOrderFinalized) {
      const message =
        "Esta orden ya está finalizada. No se puede validar PIN nuevamente.";
      setPinError(message);
      setPinErrorModalMessage(message);
      setPinErrorModalOpen(true);
      return;
    }

    if (pinConfirming || pinInput.length !== 4) return;

    setPinConfirming(true);
    setPinError(null);

    const startedAt = Date.now();
    const maskedPin = `***${pinInput.slice(-1)}`;

    console.info("[OrderDetailCard] PIN validation start", {
      orderId: data.id,
      pinLength: pinInput.length,
      pinMasked: maskedPin,
    });

    try {
      const result = await confirmDeliveryPinAction(data.id, pinInput);
      const elapsedMs = Date.now() - startedAt;

      if (!result || typeof result !== "object") {
        console.error("[OrderDetailCard] Invalid response payload", {
          orderId: data.id,
          elapsedMs,
          result,
        });
        setPinConfirmed(false);
        const fallbackMessage =
          "Respuesta inválida al validar el PIN. Intenta de nuevo.";
        setPinError(fallbackMessage);
        setPinErrorModalMessage(fallbackMessage);
        setPinErrorModalOpen(true);
        return;
      }

      if (!result.success) {
        const normalizedError =
          (result.error && String(result.error).trim()) ||
          "PIN incorrecto. Por favor, verifique con el cliente.";

        console.warn("[OrderDetailCard] PIN validation failed", {
          orderId: data.id,
          elapsedMs,
          error: normalizedError,
          errorCode: (result as any).errorCode,
          debugId: (result as any).debugId,
        });

        setPinConfirmed(false);
        setPinError(normalizedError);
        setPinErrorModalMessage(normalizedError);
        setPinErrorModalOpen(true);
        return;
      }

      console.info("[OrderDetailCard] PIN validation success", {
        orderId: data.id,
        elapsedMs,
        debugId: (result as any).debugId,
      });

      setPinConfirmed(true);
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Error inesperado validando PIN.";
      console.error("[OrderDetailCard] PIN validation exception", {
        orderId: data.id,
        error,
      });
      setPinConfirmed(false);
      setPinError(message);
      setPinErrorModalMessage(message);
      setPinErrorModalOpen(true);
    } finally {
      setPinConfirming(false);
    }
  };

  const showFloatingActions =
    !!floatingMode && (floatingMode === "see_route" || pinConfirmed);

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-32 font-openSans">
      <div className="relative h-[318px] w-screen left-1/2 -translate-x-1/2 overflow-hidden">
        <OrderDetailRouteMap
          origin={data.originCoords}
          destination={data.destinationCoords}
          driverLocation={null}
        />

        <div className="absolute left-5 top-5 z-10">
          <Link
            href="/repartidor/home"
            className="h-12 w-12 rounded-full bg-white/95 shadow flex items-center justify-center"
          >
            <ArrowLeftIcon />
          </Link>
        </div>
      </div>

      <div className="mx-auto px-5 pt-4 flex flex-col gap-4">
        <div className="w-full rounded-[14px] border border-[#DCDCDC] bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/reddi.svg"
                alt="Reddi icon"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />

              <div>
                <p className="text-base font-semibold text-black leading-6">
                  {data.customerName}
                </p>
                <p className="text-sm font-normal text-black">Reddivery</p>
              </div>
            </div>

            <button
              onClick={handleContact}
              disabled={!data.canContact}
              className="h-[33px] rounded-[25px] bg-black px-4 text-white text-[13px] font-bold flex items-center gap-2 shadow-[0_0_29.1px_rgba(0,0,0,0.25)] disabled:opacity-50"
            >
              <MessageCircle size={16} />
              Mensaje
            </button>
          </div>
        </div>

        <div className="flex w-full items-stretch gap-[17px] font-openSans">
          <div className="w-[154px] rounded-[9px] border border-[#DCDCDC] bg-[#13835F] px-3 py-2 text-white">
            <p className="text-[13px] font-bold leading-[22px] text-center">
              Ir al Local
            </p>
            <p className="text-[24px] font-bold leading-[30px] tracking-tight text-center">
              {formattedEta}
            </p>
          </div>

          <div className="flex-1 rounded-[9px] border border-[#DCDCDC] bg-white px-3 py-2">
            <p className="text-[14px] font-bold leading-[22px] text-black text-center">
              Confirma con el PIN
            </p>
            <div className="mt-1 grid w-full grid-cols-3 gap-1.5">
              <input
                value={pinInput}
                onChange={(event) => {
                  const onlyDigits = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4);
                  setPinInput(onlyDigits);
                  if (pinError) setPinError(null);
                }}
                placeholder="3427"
                inputMode="numeric"
                maxLength={4}
                disabled={isOrderFinalized || pinConfirming || pinConfirmed}
                className="h-[34px] w-full rounded-[8px] col-span-2 bg-[#F4F5F7] px-4 text-center text-[28px] tracking-[0.2em] font-bold text-black/40 outline-none disabled:opacity-80"
              />
              <button
                onClick={handleConfirmPin}
                disabled={
                  isOrderFinalized ||
                  pinConfirming ||
                  pinInput.length !== 4 ||
                  pinConfirmed
                }
                className="h-[34px] w-full rounded-[8px] bg-[#13835F] flex items-center justify-center text-white disabled:opacity-50"
                aria-label="Confirmar PIN"
              >
                {pinConfirmed ? <Check size={16} /> : <PencilLine size={16} />}
              </button>
            </div>
            {isOrderFinalized && (
              <p className="mt-1 text-[11px] font-semibold text-[#525252]">
                Orden finalizada. La validación de PIN está deshabilitada.
              </p>
            )}
            {pinConfirmed && (
              <p className="mt-1 text-[11px] font-semibold text-[#13835F]">
                PIN validado correctamente.
              </p>
            )}
          </div>
        </div>

        <div className="w-full rounded-full bg-[#F4F5F7] p-1 flex gap-1">
          <button
            onClick={() => handleStatusChange("en_route_to_pickup")}
            className={cn(
              "h-[36px] flex-1 rounded-full text-[13px] font-semibold transition-colors",
              isRecogiendoActive
                ? "bg-black text-white"
                : "bg-transparent text-black",
            )}
            disabled={statusLoading}
          >
            Recogiendo
          </button>

          <button
            onClick={() => handleStatusChange("en_route_to_delivery")}
            className={cn(
              "h-[36px] flex-1 rounded-full text-[13px] font-bold transition-colors",
              isEnCaminoActive
                ? "bg-black text-white"
                : "bg-transparent text-black",
            )}
            disabled={statusLoading}
          >
            En Camino
          </button>
        </div>

        <section className="w-full rounded-2xl border border-[#E5E5E5] bg-white px-4 py-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <h3 className="text-base font-bold text-black">
            Detalles de Entrega
          </h3>

          <div className="mt-3 flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-[#5E8E43] relative flex items-center justify-center text-white font-bold text-[30px] leading-none">
              {data.restaurantName.charAt(0).toUpperCase() || "N"}
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#E53935]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold leading-5 text-black">
                {data.restaurantName}
              </p>
              <p className="mt-1 text-[13px] font-normal text-[#71717A]">
                {data.restaurantAddress}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-[#E5E7EB] pt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-[#71717A]">Apt / Room</p>
              <p className="mt-1 text-sm font-semibold text-black">
                {data.deliveryAddress || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#71717A]">Sector & #</p>
              <p className="mt-1 text-sm font-semibold text-black">
                {data.deliverySector || "N/A"}
              </p>
            </div>
          </div>

          <button className="mt-3 w-full h-[37px] rounded-full bg-black text-white text-sm font-bold">
            {data.customerNote || "Dejar en la puerta"}
          </button>

          <div className="mt-3 rounded-[10px] bg-[rgba(251,176,59,0.08)] px-3 py-3">
            <p className="text-[13px] font-bold text-black">
              Nota de el cliente
            </p>
            <p className="mt-1 text-[13px] font-normal leading-5 text-[#525252]">
              {data.deliveryInstructions || "Sin nota adicional."}
            </p>
          </div>
        </section>

        <section className="w-full rounded-2xl border border-[#E5E5E5] bg-white px-4 py-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <h3 className="text-base font-bold text-black">Resumen del Pedido</h3>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-[#525252]">Subtotal</p>
              <p className="font-semibold text-black">
                {formatDOP(data.subtotalAmount)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[#16A34A]">Promotion</p>
              <p className="font-semibold text-[#16A34A]">
                -{formatDOP(data.discountAmount)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#525252]">
                <p>Tarifa de servicio</p>
                <Info size={12} className="text-[#71717A]" />
              </div>
              <p className="font-semibold text-black">
                {formatDOP(data.serviceFee)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#525252]">
                <p>Costo de envío</p>
                <Info size={12} className="text-[#71717A]" />
              </div>
              <p className="font-semibold text-black">
                {formatDOP(data.shippingFee)}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#525252]">
                <p>Impuesto estimado</p>
                <Info size={12} className="text-[#71717A]" />
              </div>
              <p className="font-semibold text-black">
                {formatDOP(data.estimatedTax)}
              </p>
            </div>

            <div className="border-t border-[#E5E7EB] pt-2 mt-1 flex items-center justify-between">
              <p className="text-base font-bold text-black">
                Total sin propina
              </p>
              <p className="text-base font-bold text-black">
                {formatDOP(data.totalWithoutTip)}
              </p>
            </div>
          </div>
        </section>

        <button className="w-full h-14 rounded-2xl bg-[#CF4518] text-white text-base font-bold shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
          Boton de Emergencia
        </button>
      </div>

      {showFloatingActions && floatingMode && (
        <DriverFloatingBar
          mode={floatingMode}
          amount={data.totalAmount}
          onAction={() => {
            const status = data.shipmentStatus;
            if (floatingMode === "see_route") {
              const isPickingUp =
                status === "en_route_to_pickup" ||
                status === "driver_assigned" ||
                status === "ready_for_pickup";
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
            floatingMode === "see_route"
              ? false
              : !pinConfirmed || (!data.canMarkDelivered && !data.canAccept)
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

      <Dialog
        open={pinErrorModalOpen}
        onClose={() => setPinErrorModalOpen(false)}
        transition
        className="relative z-[120] transition duration-200 ease-out data-[closed]:opacity-0"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 transition duration-200 ease-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 z-[121] flex items-center justify-center px-5">
          <DialogPanel
            transition
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl transition duration-200 ease-out data-[closed]:translate-y-2 data-[closed]:opacity-0"
          >
            <DialogTitle className="text-base font-bold text-black">
              Error validando PIN
            </DialogTitle>
            <p className="mt-2 text-sm text-[#525252]">
              {pinErrorModalMessage}
            </p>
            <button
              type="button"
              onClick={() => setPinErrorModalOpen(false)}
              className="mt-4 h-10 w-full rounded-xl bg-black text-white text-sm font-semibold"
            >
              Entendido
            </button>
          </DialogPanel>
        </div>
      </Dialog>

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
