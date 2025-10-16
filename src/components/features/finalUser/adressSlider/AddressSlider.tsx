// components/AddressSlider.tsx
"use client";

import ArrowIcon from "@/src/components/icons/ArrowIcon";
import BoatIcon from "@/src/components/icons/BoatIcon";
import VillageIcon from "@/src/components/icons/VillageIcon";
import AddressCard from "./AddressCard";
import Portal from "@/src/components/basics/Portal";
import useBodyScrollLock from "@/src/lib/hooks/useScrollBodyLock";
import { useEffect, useMemo, useState } from "react";
import NewAddressForm from "./NewAddressForm";
import { deleteUserAddress } from "@/src/lib/finalUser/addresses/actions";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import {
  fetchUserAddresses,
  updateSelectedAddress,
} from "@/src/lib/store/addressSlice";

export type AddressSliderProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddressSlider({ isOpen, onClose }: AddressSliderProps) {
  useBodyScrollLock(isOpen);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const dispatch = useAppDispatch();
  const { addresses, selectedAddressId, status, error } = useAppSelector(
    (s) => s.addresses
  );

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchUserAddresses());
    }
  }, [status, dispatch]);

  const handleNewAddress = () => {
    setIsAddingAddress(!isAddingAddress);
  };

  const mergedData = useMemo(() => {
    return addresses.map((a) => ({
      id: Number.NaN, // placeholder, AddressCard no usa id
      address: `${(a.location_type as string)?.toUpperCase?.() || ""} ${
        a.location_number
      }`.trim(),
      label: a.location_type as string,
      _rawId: a.id as unknown as string,
    })) as Array<{
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
          bg-white shadow-xl z-50
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
          <NewAddressForm onCancel={handleNewAddress} />
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
            <main className="flex-grow p-4 overflow-y-auto">
              <h3 className="text-base font-bold mb-4">
                {isAddingAddress ? "Nueva dirección" : "Direcciones guardadas"}
              </h3>
              {status === "loading" ? (
                <p className="text-sm text-gray-500">Cargando…</p>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : (
                <div className="space-y-4">
                  {mergedData.map((item: any) => (
                    <div
                      key={item._rawId || item.id}
                      className="flex items-center gap-2"
                    >
                      <AddressCard
                        icon={
                          item.label === "yate" ? <BoatIcon /> : <VillageIcon />
                        }
                        address={item.address}
                        label={String(item.label).toUpperCase()}
                        onEdit={() => alert(`Editar ${item.address}`)}
                      />
                      <button
                        className={`text-xs underline ${
                          selectedAddressId === item._rawId
                            ? "text-green-700"
                            : "text-gray-700"
                        }`}
                        onClick={async () => {
                          if (!item._rawId) return;
                          await dispatch(updateSelectedAddress(item._rawId));
                        }}
                      >
                        {selectedAddressId === item._rawId
                          ? "Seleccionada"
                          : "Seleccionar"}
                      </button>
                      <button
                        className="text-xs text-red-600 underline"
                        onClick={async () => {
                          if (!item._rawId) return;
                          const ok = window.confirm("¿Eliminar dirección?");
                          if (!ok) return;
                          await deleteUserAddress(item._rawId);
                          // Opcional: recargar direcciones del store
                          dispatch(fetchUserAddresses());
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </main>

            <footer className="p-4 flex-shrink-0">
              <button
                className="
              w-full bg-primary text-white font-medium py-3
              rounded-2xl text-center
              hover:bg-[#15803d] transition-colors
            "
                onClick={handleNewAddress}
              >
                Agregar nueva dirección
              </button>
            </footer>
          </>
        )}
      </div>
    </Portal>
  );
}
