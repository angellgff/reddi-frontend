"use client";

import BasicBackButton from "@/src/components/basics/BasicBackButton";
import { OrderStatus } from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import {
  badgeColors,
  badgeLabels,
} from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import ClockOrdersIcon from "@/src/components/icons/ClockOrdersIcon";
import { useRouter } from "next/navigation";

interface ClientOrderHeaderProps {
  id: string;
  initialStatus: OrderStatus;
  timeRemaining: number;
  customerName: string;
}

export default function ClientOrderHeader({
  id,
  initialStatus,
  timeRemaining,
  customerName,
}: ClientOrderHeaderProps) {
  const router = useRouter();

  const onBack = () => {
    router.back();
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex items-start justify-center gap-4">
          <BasicBackButton onBack={onBack} />
          <div>
            <h1 className="font-semibold">Detalle del pedido #{id}</h1>
            <h2 className="font-roboto font-normal mb-5">
              Información completa del pedido de {customerName}
            </h2>
          </div>
        </div>
        {/* Buttons removed for admin read-only view */}
      </div>
      <div className="flex items-center gap-4 justify-end my-3">
        <span
          className={`${badgeColors[initialStatus]} text-xs font-medium px-2 py-1 rounded-lg`}
        >
          {badgeLabels[initialStatus]}
        </span>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ClockOrdersIcon className="text-primary h-4 w-4" />
          <span className="font-inter">{timeRemaining} min restantes</span>
        </div>
      </div>
    </>
  );
}
