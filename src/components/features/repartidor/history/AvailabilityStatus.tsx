"use client";

import { useState, useTransition } from "react";
import { toggleDriverStatus } from "@/src/lib/actions/repartidor/toggleDriverStatus";
import { cn } from "@/src/lib/utils";

interface AvailabilityStatusProps {
  initialStatus: "online" | "offline" | string;
}

export default function AvailabilityStatus({
  initialStatus,
}: AvailabilityStatusProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (newStatus: "online" | "offline") => {
    if (newStatus === status) return;
    setStatus(newStatus); // Optimistic update
    startTransition(async () => {
      const res = await toggleDriverStatus(newStatus);
      if (res.error) {
        // Revert if error
        setStatus(status);
      }
    });
  };

  const isOnline = status === "online";

  return (
    <div className="w-full max-w-[352px] bg-white border border-[#D9DCE3] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h3 className="text-[14px] font-bold text-black font-openSans">
            Estado de Disponibilidad
          </h3>
          <p className="text-[13px] font-semibold text-[#525252] font-openSans mt-1">
            Actualmente estás {isOnline ? "en línea" : "desconectado"}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition-colors",
            isOnline
              ? "bg-[#E6FFD9] text-[#409261]"
              : "bg-gray-100 text-gray-500",
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isOnline ? "bg-[#409261]" : "bg-gray-400",
            )}
          />
          {isOnline ? "En línea" : "Offline"}
        </div>
      </div>

      <div className="flex gap-3 mt-1">
        <button
          onClick={() => handleToggle("offline")}
          disabled={isPending}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl text-[14px] font-medium font-poppins transition-all border",
            !isOnline
              ? "bg-[#595959] text-white border-[#595959] shadow-md"
              : "bg-white text-[#202124] border-[#202124] hover:bg-gray-50",
          )}
        >
          Fuera de línea
        </button>
        <button
          onClick={() => handleToggle("online")}
          disabled={isPending}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl text-[14px] font-medium font-poppins transition-all border",
            isOnline
              ? "bg-[#595959] text-white border-[#595959] shadow-md"
              : "bg-white text-[#202124] border-[#202124] hover:bg-gray-50",
          )}
        >
          En línea
        </button>
      </div>
    </div>
  );
}
