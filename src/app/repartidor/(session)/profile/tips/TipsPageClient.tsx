"use client";

import { ChevronLeft, Bell, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { TipHistoryItem } from "@/src/lib/actions/repartidor/getTipsHistory";

interface TipsPageClientProps {
  thisWeek: TipHistoryItem[];
  thisMonth: TipHistoryItem[];
}

export default function TipsPageClient({
  thisWeek,
  thisMonth,
}: TipsPageClientProps) {
  // Force re-render
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-white font-openSans overflow-hidden pb-10">
      {/* Header Background (Curved) */}
      <div
        className="absolute top-[-70px] left-[-20%] w-[140%] h-[190px] bg-[#595959]"
        style={{
          borderRadius: "50%",
          transform: "scaleX(1.1)",
        }}
      />

      {/* Header Content (Status + Nav) */}
      <div className="relative z-10 px-6 pt-12 pb-4">
        {/* Navbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-white/30 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div className="relative px-7 mt-8 mb-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-black p-1 rounded">
            {/* Placeholder for "Orders Icon" from CSS (using generic receipt icon for now) */}
            <svg
              width="22"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          {/* Title hidden in header? No, 'Historial de propinas' is explicit in CSS at top 163px */}
        </div>
        <h1
          className="text-[20px] font-bold text-black"
          style={{ lineHeight: "20px" }}
        >
          Historial de propinas
        </h1>
      </div>

      {/* Content Lists */}
      <div className="px-7 space-y-8">
        {/* Limit scroll or just flow? The CSS implies fixed sections but we want flow */}

        {/* Esta Semana */}
        <section>
          <h2 className="text-[20px] font-bold text-black mb-6">Esta Semana</h2>
          <div className="space-y-6">
            {thisWeek.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No hay propinas esta semana.
              </p>
            ) : (
              thisWeek.map((item) => <TipCard key={item.id} item={item} />)
            )}
          </div>
        </section>

        {/* Este Mes */}
        <section>
          <h2 className="text-[20px] font-bold text-black mb-6 mt-10">
            Este Mes
          </h2>
          <div className="space-y-6">
            {thisMonth.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No hay otras propinas este mes.
              </p>
            ) : (
              thisMonth.map((item) => <TipCard key={item.id} item={item} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TipCard({ item }: { item: TipHistoryItem }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Avatar/Logo */}
          <div className="w-[46px] h-[46px] rounded-full overflow-hidden flex-shrink-0 bg-gray-200 relative">
            {item.storeImage ? (
              <Image
                src={item.storeImage}
                alt={item.storeName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-500">
                {item.storeName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Text Details */}
          <div>
            <h3 className="text-[16px] font-bold text-black leading-tight">
              {item.storeName}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[#595959] text-[12px] font-semibold">
              {/* Icon placeholder for address/smoke? */}
              <div className="w-3 h-3 bg-[#595959] rounded-sm"></div>
              <span>{item.address}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#595959] text-[12px] font-semibold">
              {/* Clock icon placeholder */}
              <div className="w-3 h-3 border border-[#595959] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 border-t border-r border-[#595959] rotate-45"></div>
              </div>
              <span>{item.time}</span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="bg-[#595959] rounded-full px-3 py-1 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          <span className="text-[8px] font-bold text-white uppercase tracking-wider">
            {item.status}
          </span>
        </div>
      </div>

      {/* Row 2: Tip Button */}
      <div className="w-full bg-[#595959] rounded-[30px] h-[33px] flex items-center justify-center relative">
        <span className="text-white text-[14px] font-semibold">
          Propina &nbsp;&nbsp; RD${item.amount.toFixed(2)} +
        </span>
      </div>

      {/* Divider Line */}
      <div className="w-full h-[1px] bg-gray-100 mt-2"></div>
    </div>
  );
}
