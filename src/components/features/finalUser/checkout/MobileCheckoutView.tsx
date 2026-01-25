"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronRight,
  Info,
  Pencil,
  Check,
  X,
  Banknote,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/src/lib/utils";
import TipSliderModal from "./TipSliderModal";
import AddressSelectionModal, { Address } from "./AddressSelectionModal";
import PaymentMethodSliderModal, {
  PaymentMethod,
} from "./PaymentMethodSliderModal";

import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

interface MobileCheckoutViewProps {
  storeName: string;
  storeImage?: string | null;

  // Addresses
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;

  deliveryTime: string;

  // Instructions
  instruction: "door" | "hand";
  setInstruction: (val: "door" | "hand") => void;

  // Tips
  tipPercent: number;
  manualTipAmount: number;
  setTipPercent: (val: number) => void;
  setManualTipAmount: (val: number) => void;

  // Payment
  paymentMethodLabel?: string;
  paymentMethodIcon?: string;
  selectedPaymentMethod?: string | null; // Changed to string
  onSelectPaymentMethod: (method: string) => void; // Changed to string
  // deprecated prop from interface but kept for compatibility if needed
  onChangePayment?: () => void; // Opens payment methods

  // Coupon
  couponCode?: string;
  couponDiscount: number;
  onAddCoupon: () => void; // Opens coupon input

  // Totals
  subtotal: number;
  promotion: number;
  deliveryFee: number;
  serviceFee: number; // Usually "Taxes & Other fees"
  total: number;

  onPlaceOrder: () => void;
  canProceed: boolean;
  onBack: () => void;
}

export default function MobileCheckoutView({
  storeName,
  storeImage,
  addresses,
  selectedAddressId,
  onSelectAddress,
  deliveryTime,
  instruction,
  setInstruction,
  tipPercent,
  manualTipAmount,
  setTipPercent,
  setManualTipAmount,
  paymentMethodLabel,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onChangePayment, // kept if used by parent but overridden here
  couponCode,
  couponDiscount,
  onAddCoupon,
  subtotal,
  promotion,
  deliveryFee,
  serviceFee,
  total,
  onPlaceOrder,
  canProceed,
  onBack,
}: MobileCheckoutViewProps) {
  const [isTipSliderOpen, setIsTipSliderOpen] = useState(false);
  const [isAddressListOpen, setIsAddressListOpen] = useState(false);
  const [isPaymentListOpen, setIsPaymentListOpen] = useState(false);

  const { showCheckout, hideButton } = useFloatingButtonStore();
  React.useEffect(() => {
    showCheckout(
      "Proceder a pagar",
      formatCurrency(total),
      onPlaceOrder,
      !canProceed,
    );
    return () => hideButton();
  }, [total, canProceed, onPlaceOrder, showCheckout, hideButton]);

  // Address logic
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  // Fallback for display if no address selected but we have list
  const displayAddress = selectedAddress || addresses[0];

  return (
    <div className="min-h-screen bg-white pb-32 relative">
      {isTipSliderOpen && (
        <TipSliderModal
          onClose={() => setIsTipSliderOpen(false)}
          manualTipAmount={manualTipAmount}
          setManualTipAmount={setManualTipAmount}
          tipPercent={tipPercent}
          setTipPercent={setTipPercent}
        />
      )}

      {/* Address Selection Modal/Overlay */}
      {isAddressListOpen && (
        <AddressSelectionModal
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={onSelectAddress}
          onClose={() => setIsAddressListOpen(false)}
        />
      )}

      {/* Payment Method Slider */}
      {isPaymentListOpen && (
        <PaymentMethodSliderModal
          onClose={() => setIsPaymentListOpen(false)}
          selectedMethod={selectedPaymentMethod || null}
          onSelectMethod={(method) => onSelectPaymentMethod(method)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white px-5 pt-4 pb-2">
        <div className="relative flex items-center justify-center">
          <button
            onClick={onBack}
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100/50"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold text-black uppercase tracking-wide">
              Checkout
            </span>
            <span className="text-[20px] font-bold text-black leading-none">
              {storeName}
            </span>
          </div>
        </div>
        <div className="mt-4 h-[1px] w-full bg-gray-200" />
      </div>

      <div className="px-6 space-y-6 mt-4">
        {/* Delivery Address */}
        <section>
          <button
            onClick={() => setIsAddressListOpen(true)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="h-6 w-6 rounded-full bg-black flex items-center justify-center shrink-0">
                <div className="h-2 w-2 bg-white rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-black">
                  {displayAddress
                    ? displayAddress.alias ||
                      displayAddress.label ||
                      "Dirección"
                    : "Seleccionar dirección"}
                </span>
                <span className="text-[10px] text-black capitalize">
                  {displayAddress ? (
                    <>
                      {displayAddress.location_type}{" "}
                      {displayAddress.location_number}
                      {displayAddress.sector
                        ? `, ${displayAddress.sector}`
                        : ""}
                      {displayAddress.address /* legacy fallback */}
                    </>
                  ) : (
                    ""
                  )}
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-black group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-black">
                Tiempo de Delivery
              </span>
              <span className="text-base font-medium text-black">
                {deliveryTime}
              </span>
            </div>
          </div>
        </section>

        {/* Delivery Mode Toggle (Rapido vs Programar) */}
        <section className="rounded-md border border-gray-200 p-0 overflow-hidden">
          <div className="bg-white p-3 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-gray-600 rounded-full p-0.5 flex items-center justify-center">
                <div className="h-2.5 w-2.5 bg-gray-600 rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-black">Rapido</span>
                <span className="text-[10px] text-black">15-22 min</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 p-3 flex justify-between items-center">
            <div className="flex flex-col pl-8">
              <span className="text-[13px] font-bold text-black">
                Programar pedido
              </span>
              <span className="text-[10px] text-black">
                Pre-Ordena a donde quieras
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-black" />
          </div>
        </section>

        {/* Instructions */}
        <section>
          <h3 className="text-[13px] font-bold text-black mb-3">
            Instrucciones para el repartidor
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setInstruction("door")}
              className={`flex-1 flex items-center justify-center rounded-3xl py-2 px-4 transition-colors ${
                instruction === "door"
                  ? "bg-[#04BD88] text-white font-bold"
                  : "bg-[#F4F5F7] text-black font-bold"
              }`}
            >
              Dejar en la puerta
            </button>
            <button
              onClick={() => setInstruction("hand")}
              className={`flex-1 flex items-center justify-center rounded-3xl py-2 px-4 transition-colors ${
                instruction === "hand"
                  ? "bg-[#04BD88] text-white font-bold"
                  : "bg-[#DADADA] text-black font-bold"
              }`}
            >
              Entrégamelo a mí
            </button>
          </div>
          <div className="mt-4 bg-gray-100 p-4 rounded-lg text-xs text-gray-500">
            e.j. toca la puerta o el timbre y esperame ahi con el verifone para
            pagar en tarjeta, dejalo en la puerta...
          </div>
        </section>

        {/* Tip */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-bold text-black">
              Propina para el conductor
            </h3>
          </div>
          <div className="flex gap-3">
            {/* Edit Button */}
            <button
              onClick={() => setIsTipSliderOpen(true)}
              className={`h-9 w-12 rounded-full border border-gray-200 flex items-center justify-center ${
                manualTipAmount > 0
                  ? "bg-[#04BD88] text-white border-transparent"
                  : "bg-white text-black"
              }`}
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* 5% */}
            <button
              onClick={() => {
                setTipPercent(5);
                setManualTipAmount(0);
              }}
              className={`flex-1 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                manualTipAmount === 0 && tipPercent === 5
                  ? "bg-[#04BD88] text-white"
                  : "bg-white border border-gray-200 text-black"
              }`}
            >
              5%
            </button>

            {/* 10% */}
            <button
              onClick={() => {
                setTipPercent(10);
                setManualTipAmount(0);
              }}
              className={`flex-1 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                manualTipAmount === 0 && tipPercent === 10
                  ? "bg-[#04BD88] text-white"
                  : "bg-white border border-gray-200 text-black"
              }`}
            >
              10%
            </button>

            {/* 15% */}
            <button
              onClick={() => {
                setTipPercent(15);
                setManualTipAmount(0);
              }}
              className={`flex-1 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                manualTipAmount === 0 && tipPercent === 15
                  ? "bg-[#04BD88] text-white"
                  : "bg-[#F4F5F7] border border-[#D9DCE3] text-black"
              }`}
            >
              15%
            </button>
          </div>
        </section>

        {/* Payment & Coupon */}
        <section className="flex gap-3">
          {/* Payment Method */}
          <button
            onClick={() => setIsPaymentListOpen(true)}
            className="flex-1 flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-bold text-black flex items-center gap-1">
                Elige tu forma de pago <Pencil className="h-3 w-3" />
              </span>
              <div className="flex items-center gap-2 mt-1">
                {selectedPaymentMethod === "cash" ? (
                  <>
                    <Banknote className="h-5 w-5 text-green-600" />
                    <span className="text-xs font-bold">Efectivo</span>
                  </>
                ) : selectedPaymentMethod === "physical_pos" ? (
                  <>
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-bold">Datáfono</span>
                  </>
                ) : (
                  <>
                    <div className="h-5 w-8 bg-gray-300 rounded overflow-hidden">
                      <div className="w-full h-full bg-gray-400/50" />
                    </div>
                    <span className="text-xs font-bold">....</span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-black" />
          </button>

          {/* Coupon - Using "Agregar" style from CSS */}
          <button
            onClick={onAddCoupon}
            className="flex-1 flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white"
          >
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-bold text-black flex items-center gap-1">
                Agregar <Pencil className="h-3 w-3" />
              </span>
              <div className="flex items-center gap-1 mt-1">
                {/* Payment icons row placeholder per CSS */}
                <div className="flex gap-0.5">
                  <span className="text-[10px] text-blue-600 font-bold">
                    VISA
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold">
                    stripe
                  </span>
                </div>
              </div>
            </div>
          </button>
        </section>

        {/* Coupon Applied Row (if applicable) */}
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div>
              <span className="block text-base font-semibold text-black">
                Cupon aplicado
              </span>
              <span className="text-sm text-[#05A357]">
                Te estas ahorrando {formatCurrency(couponDiscount)}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-black" />
          </div>
        )}

        {/* Order Summary */}
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-[#6B6B6B]">
              Subtotal
            </span>
            <span className="text-base font-semibold text-black">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {promotion > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-[#6B6B6B]">
                Promotion
              </span>
              <span className="text-base font-semibold text-[#05A357]">
                - {formatCurrency(promotion)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[#6B6B6B]">
                Delivery fee
              </span>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-base font-semibold text-black">
              {formatCurrency(deliveryFee)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-[#6B6B6B]">
                Impuestos & Otros cargos
              </span>
              <Info className="h-4 w-4 text-gray-400" />
            </div>
            <span className="text-base font-semibold text-black">
              {formatCurrency(serviceFee)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-base font-medium text-black">Total</span>
            <span className="text-base font-semibold text-black">
              {formatCurrency(total)}
            </span>
          </div>
        </section>

        <p className="text-xs text-gray-500 leading-relaxed text-center mt-6 mb-24">
          Si no te encuentras disponible cuando llegue el repartidor, tu pedido
          será dejado en la puerta. Al realizar tu pedido, aceptas asumir total
          responsabilidad del mismo una vez haya sido entregado.
        </p>

      </div>
    </div>
  );
}
