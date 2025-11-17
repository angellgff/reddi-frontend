"use client";

import Image from "next/image";
import Link from "next/link";
import ClockIcon from "@/src/components/icons/OrderClockIcon";
import HomeIcon from "@/src/components/icons/OrderHomeIcon";

export type StatusType = "Recogiendo" | "Nueva" | "Entregando";

const statusStyles: Record<
  StatusType,
  { badgeClasses: string; dotClasses: string }
> = {
  Nueva: {
    badgeClasses: "bg-[#FF30081F] text-[#FF3008]",
    dotClasses: "bg-[#FF3008]",
  },
  Recogiendo: {
    badgeClasses: "bg-[#E6EBF2] text-[#2196F3]",
    dotClasses: "bg-[#2196F3]",
  },
  Entregando: {
    badgeClasses: "bg-[#E9FFEF] text-[#409261]",
    dotClasses: "bg-[#409261]",
  },
};

export interface OrderCardProps {
  orderId: string;
  restaurantName: string;
  address: string;
  deliveryTime: string;
  logoUrl: string;
  status: StatusType;
  onAccept: (orderId: string) => void;
}

export default function OrderCard({
  orderId,
  restaurantName,
  address,
  deliveryTime,
  logoUrl,
  status,
  onAccept,
}: OrderCardProps) {
  const currentStatusStyles = statusStyles[status];
  return (
    <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-gray-200 shadow-sm mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Image
              src={logoUrl}
              alt={`Logo de ${restaurantName}`}
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <div>
            <Link
              href={`/repartidor/orders/${orderId}`}
              className="text-lg font-bold text-gray-800 hover:underline"
            >
              <span className="text-emerald-500">Pedido</span> #
              {orderId.split("-")[0]}
            </Link>
            <p className="text-sm text-gray-500 font-roboto">
              {restaurantName}
            </p>
          </div>
        </div>
        {/*STATUS */}
        <span
          className={`inline-flex items-center gap-1 ${currentStatusStyles.badgeClasses} text-xs font-medium px-3 py-1 rounded-full`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${currentStatusStyles.dotClasses}`}
          ></span>
          <span className="font-inter">{status}</span>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 mb-5 text-[#525252]">
        <div className="flex items-center gap-3 ">
          <HomeIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-roboto">{address}</span>
        </div>
        <div className="flex items-center gap-3">
          <ClockIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="text-sm">{deliveryTime}</span>
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={() => onAccept(orderId)}
        className="w-full bg-white border border-black text-gray-800 font-semibold py-2 rounded-xl hover:bg-gray-800 hover:text-white transition-colors duration-200"
      >
        Aceptar pedido
      </button>
    </div>
  );
}
