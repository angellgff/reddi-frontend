"use client";

import Image from "next/image";
import Link from "next/link";
import OrderHomeIcon from "@/src/components/icons/OrderHomeIcon";
import { cn } from "@/src/lib/utils";
import CheckIcon from "@/src/components/icons/CheckIcon";
import { useRouter } from "next/navigation";
import ClockOrdersIcon from "@/src/components/icons/ClockOrdersIcon";

// Adjusted to match the design requirements
export type StatusType = "Preparando" | "Nueva" | "En camino" | "Completado";

interface StatusConfig {
  badgeText: string;
  badgeClasses: string;
  dotColor?: string; // If we keep dots
  buttonText: string;
  buttonClasses: string;
  isCompleted?: boolean;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  Nueva: {
    badgeText: "NUEVO",
    badgeClasses: "bg-[#CF4518] text-white",
    buttonText: "Aceptar pedido",
    buttonClasses: "bg-[#13835F] text-white hover:bg-[#0f6f51]",
  },
  Preparando: {
    badgeText: "En Curso",
    badgeClasses: "bg-[#595959] text-white",
    buttonText: "En Curso",
    buttonClasses: "bg-[#595959] text-white cursor-default",
  },
  "En camino": {
    badgeText: "En Curso",
    badgeClasses: "bg-[#595959] text-white",
    buttonText: "En Curso",
    buttonClasses: "bg-[#595959] text-white cursor-default",
  },
  Completado: {
    badgeText: "", // Special case, maybe no badge or text
    badgeClasses: "hidden",
    buttonText: "Completado",
    buttonClasses: "bg-[#F2F2F2] text-[#595959] cursor-default",
    isCompleted: true,
  },
};

export interface OrderCardProps {
  orderId: string;
  restaurantName: string;
  address: string;
  deliveryTime: string;
  logoUrl: string;
  status: StatusType;
  isAssigned: boolean;
  onAccept: (orderId: string) => void;
}

export default function OrderCard({
  orderId,
  restaurantName,
  address,
  deliveryTime,
  logoUrl,
  status,
  isAssigned,
  onAccept,
}: OrderCardProps) {
  const router = useRouter();

  // Determine the display configuration based on status and assignment
  // Default to "Nueva" config
  let configKey: StatusType = "Nueva";

  if (status === "Completado") {
    configKey = "Completado";
  } else if (isAssigned) {
    // If assigned and active (not completed), show as "En Curso" (which maps to Preparando config)
    configKey = "Preparando";
  } else {
    // If not assigned and not completed, show as "Nueva" (Acceptable)
    configKey = "Nueva";
  }

  const config = statusConfig[configKey] || statusConfig["Nueva"];
  const isCompleted = config.isCompleted;

  // Logical check for enabling the button
  const canAccept = configKey === "Nueva";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAccept) {
      onAccept(orderId);
    }
  };

  const handleCardClick = () => {
    router.push(`/repartidor/orders/${orderId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "cursor-pointer relative w-full rounded-[17px] border border-[#D9D9D9] bg-white p-3 font-openSans",
      )}
    >
      {/* Top Section: Avatar + Info */}
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative h-[46px] w-[46px] shrink-0">
          <Image
            src={logoUrl || "/placeholder-restaurant.png"}
            alt={restaurantName}
            fill
            className="rounded-full object-cover"
          />
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="truncate pr-2 text-[16px] font-bold leading-[18px] text-black">
              {restaurantName}
            </h3>

            {/* Status Badge (Top Right) */}
            {!isCompleted && (
              <div
                className={cn(
                  "rounded-full px-2 py-[2px] flex items-center gap-1",
                  config.badgeClasses,
                )}
              >
                <div className="w-[5px] h-[5px] rounded-full bg-white" />
                <span className="text-[7px] font-bold uppercase leading-none tracking-wide">
                  {config.badgeText}
                </span>
              </div>
            )}
          </div>

          {/* Address Line */}
          <div className="mt-1 flex items-center gap-1">
            <OrderHomeIcon className="w-[14px] h-[14px]" fill="#595959" />
            <span className="truncate text-[12px] font-semibold leading-tight text-black">
              {address}
            </span>
          </div>

          {/* Time / Completed Line */}
          <div className="mt-1 flex items-center gap-1">
            {isCompleted ? (
              // Completed State: Checkmark + Text
              <div className="flex items-center gap-1">
                <div className="border border-[#595959] rounded-sm p-[1px]">
                  <CheckIcon className="w-2 h-2 text-[#595959]" />
                </div>
                <span className="text-[12px] font-semibold text-[#595959]">
                  Completado
                </span>
              </div>
            ) : (
              // Active State: Box + Time
              <>
                <ClockOrdersIcon className="h-[10px] w-[10px]" fill="#CF4518" />
                <span className="text-[12px] font-semibold text-[#CF4518]">
                  {deliveryTime}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Button Section */}
      <div className="mt-3">
        <button
          onClick={handleClick}
          disabled={!canAccept}
          className={cn(
            "flex h-[33px] w-full items-center justify-center rounded-full text-[16px] font-bold transition-colors",
            config.buttonClasses,
          )}
        >
          {config.buttonText}
        </button>
      </div>
    </div>
  );
}
