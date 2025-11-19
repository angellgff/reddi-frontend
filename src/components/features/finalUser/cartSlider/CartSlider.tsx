"use client";

import Portal from "@/src/components/basics/Portal";
import useBodyScrollLock from "@/src/lib/hooks/useScrollBodyLock";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import {
  selectCartItems,
  CartItem as CartItemType,
} from "@/src/lib/store/cartSlice";
import { closeCart, selectCartOpen } from "@/src/lib/store/uiSlice";
import CartHeader from "./CartHeader";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { fetchPartnerBasics } from "./actions";

type CartSliderProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function CartSlider({ isOpen, onClose }: CartSliderProps) {
  const dispatch = useAppDispatch();
  const openFromStore = useAppSelector(selectCartOpen);
  const effectiveOpen = typeof isOpen === "boolean" ? isOpen : openFromStore;
  useBodyScrollLock(effectiveOpen);
  const items = useAppSelector(selectCartItems);
  const [partnerName, setPartnerName] = useState<string>("Tu carrito");
  const [partnerLogo, setPartnerLogo] = useState<string | null>(null);
  const [partnerAddress, setPartnerAddress] = useState<string>("");
  const [isRestaurant, setIsRestaurant] = useState<boolean>(false);

  // <<< LOG AÑADIDO 1: Muestra todos los items del carrito desde Redux
  useEffect(() => {
    console.log("🛒 [CartSlider] Items en el carrito (desde Redux):", items);
  }, [items]);

  // <<< LOG AÑADIDO 2: Muestra el estado de isRestaurant cada vez que cambia
  useEffect(() => {
    console.log(
      `🍔 [CartSlider] ¿Es un restaurante? -> ${isRestaurant}. La prop 'enableExtras' se basará en esto.`
    );
  }, [isRestaurant]);

  useEffect(() => {
    const doClose = () => {
      if (onClose) onClose();
      else dispatch(closeCart());
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") doClose();
    };
    if (effectiveOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [effectiveOpen, onClose, dispatch]);

  useEffect(() => {
    let cancelled = false;
    const loadPartner = async () => {
      const pId = items[0]?.partnerId;
      const data = await fetchPartnerBasics(pId);
      if (cancelled) return;
      if (!data) {
        setPartnerName("Tu carrito");
        setPartnerLogo(null);
        setPartnerAddress("");
        setIsRestaurant(false);
        return;
      }
      setPartnerName(data.name || "Tu carrito");
      setPartnerLogo(data.image_url || null);
      setPartnerAddress(data.address || "");
      setIsRestaurant(data.partner_type === "restaurant");
    };
    loadPartner();
    return () => {
      cancelled = true;
    };
  }, [items]);

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-50 ${
          effectiveOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!effectiveOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            effectiveOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => (onClose ? onClose() : dispatch(closeCart()))}
        />

        {/* Panel deslizante desde la derecha */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-panel-title"
          className={`absolute right-0 top-0 h-full w-full md:w-[480px] lg:w-[560px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            effectiveOpen ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2
              id="cart-panel-title"
              className="text-lg font-semibold font-rubik"
            >
              Tu carrito
            </h2>
            <button
              type="button"
              onClick={() => (onClose ? onClose() : dispatch(closeCart()))}
              aria-label="Cerrar carrito"
              className="p-2 rounded-full hover:bg-black/10"
            >
              {/* Simple icono de cerrar (X) inline para evitar dependencias nuevas */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                className="text-gray-700"
              >
                <path
                  d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 space-y-3">
            <CartHeader
              partnerName={partnerName}
              address={partnerAddress}
              itemsCount={items.reduce(
                (s: number, i: CartItemType) => s + i.quantity,
                0
              )}
              logoUrl={partnerLogo}
            />

            {items.length === 0 ? (
              <div className="text-sm text-gray-600">
                Tu carrito está vacío por ahora.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it: CartItemType) => {
                  // <<< LOG AÑADIDO 3: Muestra los datos de cada item ANTES de renderizarlo
                  console.log(
                    `  - [CartSlider] Renderizando CartItem para '${it.name}'. Datos pasados:`,
                    {
                      item: it,
                      enableExtras: isRestaurant,
                    }
                  );
                  return (
                    <CartItem
                      key={it.id}
                      item={it}
                      enableExtras={isRestaurant}
                    />
                  );
                })}
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="p-4 border-t border-gray-200">
            <CartSummary />
          </footer>
        </aside>
      </div>
    </Portal>
  );
}
