"use client";

import { Bell, ChevronDown, User } from "lucide-react";

export default function HomeHeader() {
  return (
    <div className="flex justify-between items-start pt-2 pb-4 px-4">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-black/60">Casa De Campo</span>
        <div className="flex items-center gap-1">
          <span className="text-[15px] font-bold text-black">
            Altos De Chavon
          </span>
          <ChevronDown className="w-4 h-4 text-black" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="w-6 h-6 text-black" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {/* Placeholder for user avatar */}
          <User className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
