"use client";

import React from "react";
import { X } from "lucide-react";

export interface Address {
  id: string;
  alias?: string | null;
  location_number?: string;
  location_type?: string;
  sector?: string | null;
  delivery_instructions?: string | null;
  // compatibility with potential legacy types
  label?: string | null;
  address?: string | null;
  details?: string | null;
}

interface AddressSelectionModalProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  onClose: () => void;
}

export default function AddressSelectionModal({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onClose,
}: AddressSelectionModalProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 backdrop-blur-[2px]">
      <div className="w-full bg-white rounded-t-[16px] p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Seleccionar dirección</h3>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => {
                onSelectAddress(addr.id);
                onClose();
              }}
              className={`w-full text-left p-4 rounded-xl border ${
                addr.id === selectedAddressId
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200"
              }`}
            >
              <div className="font-bold">
                {addr.alias || addr.label || "Dirección"}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {addr.location_type} {addr.location_number}
                {addr.sector ? `, ${addr.sector}` : ""}
                {addr.address /* fallback for legacy */}
              </div>
              {(addr.delivery_instructions || addr.details) && (
                <div className="text-xs text-gray-400">
                  {addr.delivery_instructions || addr.details}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
