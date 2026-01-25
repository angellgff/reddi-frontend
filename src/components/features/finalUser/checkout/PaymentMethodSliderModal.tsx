"use client";

import React from "react";
import { X, CreditCard, Banknote } from "lucide-react";

export interface PaymentMethodOption {
  method: string;
  provider: string;
  brand: string;
}

interface PaymentMethodSliderModalProps {
  onClose: () => void;
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
}

export default function PaymentMethodSliderModal({
  onClose,
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSliderModalProps) {
  const methods: PaymentMethodOption[] = [
    {
      method: "cash",
      provider: "manual",
      brand: "Efectivo",
    },
    {
      method: "physical_pos",
      provider: "manual",
      brand: "Datáfono",
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-[2px]">
      <div className="w-full bg-white rounded-t-[16px] p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Método de pago</h3>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {methods.map((option) => {
            const isSelected = selectedMethod === option.method;
            const Icon = option.method === "cash" ? Banknote : CreditCard;

            return (
              <button
                key={option.method}
                onClick={() => {
                  onSelectMethod(option.method);
                  onClose();
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">
                    {option.brand}
                  </p>
                  <p className="text-xs text-gray-500">Paga al recibir</p>
                </div>
                <div className="ml-auto">
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-emerald-500" : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
