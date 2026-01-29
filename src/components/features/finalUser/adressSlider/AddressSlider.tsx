// components/AddressSlider.tsx
"use client";

import ArrowIcon from "@/src/components/icons/ArrowIcon";
import BoatIcon from "@/src/components/icons/BoatIcon";
import VillageIcon from "@/src/components/icons/VillageIcon";
import AddressCard from "./AddressCard";
import Portal from "@/src/components/basics/Portal";
import useBodyScrollLock from "@/src/lib/hooks/useScrollBodyLock";
import { useEffect, useMemo, useState } from "react";
import CreateAddressForm from "@/src/components/features/finalUser/createAddress/CreateAddressForm";
import { Tables } from "@/src/lib/database.types";
import { MapPin, Check, Pencil, Trash2, ChevronRight } from "lucide-react";
type UserAddress = Tables<"user_addresses">;

import { deleteUserAddress } from "@/src/lib/finalUser/addresses/actions";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import {
  fetchUserAddresses,
  updateSelectedAddress,
} from "@/src/lib/store/addressSlice";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

export type AddressSliderProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddressSlider({ isOpen, onClose }: AddressSliderProps) {
  useBodyScrollLock(isOpen);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null,
  );
  const dispatch = useAppDispatch();
  const { addresses, selectedAddressId, status, error } = useAppSelector(
    (s) => s.addresses,
  );
  const { hideButton, showSearch } = useFloatingButtonStore();

  useEffect(() => {
    if (isOpen) {
      hideButton();
    } else {
      // Cuando se cierra, podríamos querer restaurar el botón.
      // Asumiremos que volver a showSearch es seguro por ahora,
      // o dejamos que la página subyacente lo maneje si se remonta/actualiza.
      // Si el botón debe reaparecer al cerrar, showSearch() es lo más común.

      // NOTA: Si esto causa problemas en páginas que NO deben tener botón,
      // habría que hacerlo condicional. Por ahora,AddressSlider se usa principalmente donde hay botón.
      showSearch();
    }
  }, [isOpen, hideButton, showSearch]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUserAddresses());
    }
  }, [status, dispatch]);

  const handleNewAddress = () => {
    setIsAddingAddress(!isAddingAddress);
    setEditingAddress(null);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setIsAddingAddress(true);
  };

  const mergedData = useMemo(() => {
    return addresses.map((a) => {
      let displayAddress = "Dirección";
      // Prioritize alias if available (user defined name)
      if (a.alias) {
        displayAddress = a.alias;
      } else if (a.location_type && a.location_number) {
        // Formato: Villa #123 (Capitalized)
        const type =
          a.location_type.charAt(0).toUpperCase() +
          a.location_type.slice(1).toLowerCase();
        displayAddress = `${type} #${a.location_number}`;
      }

      return {
        id: Number.NaN, // placeholder
        address: displayAddress,
        label: a.location_type as string,
        _rawId: a.id as unknown as string,
      };
    }) as Array<{
      id: number;
      address: string;
      label: string;
      _rawId: string;
    }>;
  }, [addresses]);

  return (
    <Portal>
      {/* 2. El Panel Deslizante */}
      <div
        className={`
          fixed top-0 left-0 h-full w-full
          bg-white shadow-xl z-[100]
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-panel-title"
      >
        {/* Encabezado */}
        {isAddingAddress ? (
          <CreateAddressForm
            onCancel={handleNewAddress}
            onSuccess={() => {
              handleNewAddress();
              dispatch(fetchUserAddresses());
            }}
            initialData={editingAddress}
            shouldRestoreFloatingButton={false}
          />
        ) : (
          <>
            <header className="flex items-center p-4 border-gray-200 flex-shrink-0">
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-black/20"
              >
                <ArrowIcon />
              </button>
              <h2
                id="address-panel-title"
                className="text-xl font-bold px-4 w-full"
              >
                Direcciones
              </h2>
            </header>
            <main className="flex-grow p-4 overflow-y-auto font-sans">
              <h3 className="text-[20px] font-bold text-black font-open-sans leading-tight mb-6">
                {isAddingAddress ? "Nueva dirección" : "Direcciones guardadas"}
              </h3>
              {status === "loading" ? (
                <p className="text-sm text-gray-500">Cargando…</p>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : (
                <div className="flex flex-col gap-4 font-open-sans bg-[#F4F5F7] p-2 rounded-xl">
                  {mergedData.map((item) => {
                    const isSelected = selectedAddressId === item._rawId;
                    return (
                      <div
                        key={item._rawId || item.id}
                        onClick={async () => {
                          if (!item._rawId) return;
                          await dispatch(updateSelectedAddress(item._rawId));
                        }}
                        className={`w-full h-[64px] bg-white rounded-2xl flex items-center px-5 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "border-green-500 ring-1 ring-green-500"
                            : "border-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <MapPin className="w-5 h-5 text-black shrink-0" />
                          <span className="text-[16px] font-semibold text-black truncate">
                            {item.address}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const fullAddr = addresses.find(
                              (a) => a.id === item._rawId,
                            );
                            if (fullAddr) handleEditAddress(fullAddr);
                          }}
                          className="w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0 hover:bg-gray-100"
                        >
                          <ChevronRight className="w-3 h-3 text-black" />
                        </button>
                      </div>
                    );
                  })}

                  {/* New Address Card */}
                  <div
                    onClick={handleNewAddress}
                    className="w-full h-[64px] bg-white rounded-2xl flex items-center px-5 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-gray-50 justify-between cursor-pointer hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Pencil className="w-5 h-5 text-black shrink-0" />
                      <span className="text-[16px] font-semibold text-black">
                        Nueva dirección
                      </span>
                    </div>
                    <span className="w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-black" />
                    </span>
                  </div>
                </div>
              )}
            </main>

            {/* Removed footer button as it is now in the list */}
          </>
        )}
      </div>
    </Portal>
  );
}
