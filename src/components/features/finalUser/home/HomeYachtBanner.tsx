"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomeYachtBanner() {
  return (
    <div className="relative w-full h-[166px] rounded-[14px] overflow-hidden my-6 group cursor-pointer shadow-lg">
      <div className="absolute inset-0 bg-gray-900">
        {/* Placeholder for the background image */}
        <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-800" />
      </div>

      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        <div className="text-white">
          <h3 className="text-[20px] font-bold leading-tight drop-shadow-md">
            Directo a tu yate
          </h3>
          <p className="text-[12px] font-semibold mt-1 opacity-90">Snacks</p>
        </div>

        <div className="flex justify-end items-end w-full">
          <span className="text-[10px] font-semibold text-white underline decoration-white/50 underline-offset-2">
            Mostrar Todos
          </span>
        </div>
      </div>
    </div>
  );
}
