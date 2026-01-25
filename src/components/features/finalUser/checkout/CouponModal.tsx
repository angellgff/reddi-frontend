"use client";

import React from "react";
import { X, Ticket } from "lucide-react";

interface CouponModalProps {
  onClose: () => void;
  couponInput: string;
  setCouponInput: (val: string) => void;
  validateCoupon: () => void;
  isValidatingCoupon: boolean;
  couponMsg: string | null;
  storedCouponCode?: string;
}

export default function CouponModal({
  onClose,
  couponInput,
  setCouponInput,
  validateCoupon,
  isValidatingCoupon,
  couponMsg,
  storedCouponCode,
}: CouponModalProps) {
  const isSuccess = !!storedCouponCode && couponMsg === "Cupón aplicado."; // Or check if storedCouponCode is present and msg matches
  // Simplified logic from page.tsx: storedCoupon ? text-green : text-red
  const isGreen = !!storedCouponCode;

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 backdrop-blur-[2px]">
      <div className="w-full bg-white rounded-t-[16px] p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#04BD88]" />
            Cupón de descuento
          </h3>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2 font-medium">
              Ingresa el código
            </label>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="CÓDIGO"
                className="flex-1 h-12 rounded-xl border border-gray-300 px-4 text-base outline-none focus:ring-2 focus:ring-[#04BD88]/20 focus:border-[#04BD88] uppercase"
                disabled={isValidatingCoupon}
              />
              <button
                onClick={validateCoupon}
                disabled={isValidatingCoupon || !couponInput.trim()}
                className="h-12 px-6 rounded-xl bg-[#04BD88] text-white font-bold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isValidatingCoupon ? "..." : "Aplicar"}
              </button>
            </div>
          </div>

          {couponMsg && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                isGreen
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}
            >
              {couponMsg}
            </div>
          )}
        </div>

        <div className="mt-8">
           <button
            onClick={onClose}
            className="w-full h-12 rounded-[25px] border border-gray-200 text-black font-bold hover:bg-gray-50 bg-white"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
