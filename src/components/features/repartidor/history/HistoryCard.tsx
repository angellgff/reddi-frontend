"use client";
import Image from "next/image";
import { HistoryOrderItem } from "@/src/lib/repartidor/history/getHistoryOrders";

export default function HistoryCard({ item }: { item: HistoryOrderItem }) {
  return (
    <div className="flex flex-col p-4 gap-3 bg-white border border-[#D9DCE3] rounded-xl w-full max-w-[352px] mx-auto">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-[35px] h-[35px] rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden">
            <Image
              src={item.logoUrl}
              alt={item.restaurantName}
              width={35}
              height={35}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-[16px] font-bold text-black">
              Pedido{" "}
              <span className="text-primary">
                #{item.orderId.split("-")[0]}
              </span>
            </p>
            <div className="flex items-center gap-2 text-[14px] text-[#475569]">
              <span>{item.address}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[12px] text-[#525252] font-inter">
            {item.deliveredAt}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E9FFEF] text-[#409261] text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#409261]"></span>
            Finalizado
          </span>
        </div>
      </div>
      <div className="w-full h-px bg-gray-300" />
      <div className="flex justify-between text-[14px] text-[#525252]">
        <span>Propina</span>
        <span className="text-[#171717] font-medium">{item.tip}</span>
      </div>
    </div>
  );
}
