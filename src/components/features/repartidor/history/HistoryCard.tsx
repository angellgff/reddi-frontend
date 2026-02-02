"use client";
import { HistoryOrderItem } from "@/src/lib/repartidor/history/getHistoryOrders";
import { MapPin } from "lucide-react";

export default function HistoryCard({ item }: { item: HistoryOrderItem }) {
  return (
    <div className="flex flex-col p-4 gap-4 bg-white border border-[#D9DCE3] rounded-xl w-full max-w-[352px] mx-auto">
      <div className="flex justify-between items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[14px] font-bold text-black font-openSans">
            Pedido #{item.orderId.split("-")[0]}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#595959]" />
            </div>
            <span className="text-[13px] font-semibold text-[#475569] font-openSans">
              {item.address}
            </span>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[12px] text-[#525252] font-inter text-right">
            {item.deliveredAt}
          </span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#E9FFEF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#409261]"></span>
            <span className="text-[#409261] text-[12px] font-normal font-inter">
              Finalizado
            </span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-[#D9DCE3]" />

      {/* Bottom Row */}
      <div className="flex justify-between items-center text-[14px]">
        <span className="text-[#525252] font-roboto font-normal">Propina</span>
        <span className="text-[#171717] font-inter font-normal">
          {item.tip}
        </span>
      </div>
    </div>
  );
}
