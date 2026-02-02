"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function HistoryHeader() {
  const router = useRouter();

  return (
    <div className="w-full bg-black px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <button
        onClick={() => router.back()}
        className="flex items-center justify-center w-8 h-8"
      >
        <ArrowLeft className="w-6 h-6 text-[#CDF7E7]" />
      </button>

      <span className="text-white font-poppins font-medium text-[16px]">
        Historial
      </span>

      <button className="flex flex-col gap-1 items-end w-8 justify-center">
        {/* Custom Menu Icon mimicking the screenshot */}
        <div className="w-5 h-[2px] bg-white rounded-full"></div>
        <div className="w-[12px] h-[2px] bg-white rounded-full"></div>
        <div className="w-5 h-[2px] bg-white rounded-full"></div>
      </button>
    </div>
  );
}
