// components/OrderHeader.tsx
"use client";

import BasicBackButton from "@/src/components/basics/BasicBackButton";
import { OrderStatus } from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import { useState, useTransition } from "react";
import {
  badgeColors,
  badgeLabels,
} from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import ClockOrdersIcon from "@/src/components/icons/ClockOrdersIcon";
import { useRouter } from "next/navigation";

interface OrderHeaderProps {
  id: string;
  initialStatus: OrderStatus;
  timeRemaining: number;
  customerName: string;
}

const buttonStyles = "py-4 px-6 font-medium rounded-2xl transition-colors";

export default function OrderHeader({
  id,
  initialStatus,
  timeRemaining,
  customerName,
}: OrderHeaderProps) {
  // 1. Estado para el status del pedido (actualización optimista)
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  // 2. Transiciones separadas para feedback de carga específico
  const [isAccepting, startAcceptTransition] = useTransition();
  const [isRejecting, startRejectTransition] = useTransition();
  const [isReadying, startReadyTransition] = useTransition();

  const isProcessing = isAccepting || isRejecting || isReadying;

  const onBack = () => {
    router.back();
  };

  const handleAccept = () => {
    startAcceptTransition(async () => {
      // await acceptOrder(id);
      setStatus("preparation");
    });
  };

  const handleReject = () => {
    startRejectTransition(async () => {
      // await rejectOrder(id);
      // Se borrará? O cambiará a otro estado? De momento canceled
      setStatus("canceled");
    });
  };

  const handleReady = () => {
    startReadyTransition(async () => {
      // await markOrderAsReady(id);
      setStatus("delivered");
    });
  };

  const isAvailable = status === "new" || status === "pending";

  return (
    <>
      <div className="flex justify-between items-center">
        {/* Título */}
        <div className="flex items-start justify-center gap-4">
          <BasicBackButton onBack={onBack} />
          <div>
            <h1 className="font-semibold">Detalle del pedido #{id}</h1>
            <h2 className="font-roboto font-normal mb-5">
              Información completa del pedido de {customerName}
            </h2>
          </div>
        </div>

        <div className="flex gap-4">
          {isAvailable ? (
            <>
              <button
                className={`${buttonStyles} bg-error text-white hover:bg-red-700  disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleReject}
                disabled={isProcessing}
              >
                {isRejecting ? "Rechazando..." : "Rechazar"}
              </button>
              <button
                className={`${buttonStyles} bg-primary text-white  hover:bg-teal-600  disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleAccept}
                disabled={isProcessing}
              >
                {isAccepting ? "Aceptando..." : "Aceptar"}
              </button>
            </>
          ) : status === "preparation" ? (
            <button
              className={`${buttonStyles} bg-primary text-white hover:bg-teal-600  disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={handleReady}
              disabled={isProcessing}
            >
              {isReadying ? "Completando pedido..." : "Marcar como listo"}
            </button>
          ) : status === "delivered" ? (
            <button
              className={`${buttonStyles} bg-primary text-white  opacity-50 cursor-not-allowed`}
            >
              Pedido entregado
            </button>
          ) : status === "canceled" ? (
            <button
              className={`${buttonStyles} bg-error text-white opacity-50 cursor-not-allowed`}
            >
              Pedido cancelado
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-4 justify-end my-3">
        <span
          className={`${badgeColors[status]} text-xs font-medium px-2 py-1 rounded-lg`}
        >
          {badgeLabels[status]}
        </span>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockOrdersIcon className="text-primary h-4 w-4" />
          <span className="font-inter">{timeRemaining} min restantes</span>
        </div>
      </div>
    </>
  );
}
