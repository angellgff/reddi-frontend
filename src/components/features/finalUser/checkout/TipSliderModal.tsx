"use client";

import React from "react";
import { X } from "lucide-react";

interface TipSliderModalProps {
  onClose: () => void;
  manualTipAmount: number;
  setManualTipAmount: (val: number) => void;
  tipPercent: number;
  setTipPercent: (val: number) => void;
}

export default function TipSliderModal({
  onClose,
  manualTipAmount,
  setManualTipAmount,
  tipPercent,
  setTipPercent,
}: TipSliderModalProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/30 backdrop-blur-[2px]">
      <div
        className="relative w-full max-w-md bg-white rounded-t-[16px] px-7 pt-6 pb-10 animate-in slide-in-from-bottom duration-300"
        style={{ height: "auto", minHeight: "400px" }}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onClose}>
            <X className="h-6 w-6 text-black" />
          </button>
          <h2 className="text-[20px] font-bold text-black flex-1 text-center pr-6">
            Propina para el repartidor
          </h2>
        </div>

        {/* Amount Display/Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-[#F4F5F7] rounded-lg px-4 py-3">
            <input
              type="number"
              placeholder="0"
              value={manualTipAmount > 0 ? manualTipAmount : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setManualTipAmount(isNaN(val) ? 0 : val);
                setTipPercent(0); // Clear percent if manual
              }}
              className="bg-transparent text-[16px] font-semibold text-[#484848] w-full outline-none"
            />
            <span className="text-[16px] font-semibold text-[#484848] opacity-50">
              RD$
            </span>
          </div>
        </div>

        {/* Preset Percentages */}
        <div className="flex gap-3 mb-8">
          {[5, 10, 15].map((pct) => (
            <button
              key={pct}
              onClick={() => {
                setTipPercent(pct);
                setManualTipAmount(0);
              }}
              className={`flex-1 h-[49px] rounded-[28px] flex items-center justify-center text-[15px] font-bold transition-colors ${
                manualTipAmount === 0 && tipPercent === pct
                  ? "bg-[#04BD88] text-white"
                  : "bg-[#F4F5F7] text-black"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>

        <p className="text-[13px] font-semibold text-[#6A6C71] text-center px-4 leading-[18px]">
          Tu generosidad será directamente destinada al repartidor.
        </p>
      </div>
    </div>
  );
}
