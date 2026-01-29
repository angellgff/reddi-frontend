"use client";

import { useAppSelector, useAppDispatch } from "@/src/lib/store/hooks";
import { toggleAddressSlider, toggleCart } from "@/src/lib/store/uiSlice";
import { ChevronDown, Home } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/src/components/basics/header/Badge";
import { selectCartCount } from "@/src/lib/store/cartSlice";

interface CustomSearchHeaderProps {
  title?: string;
  icon?: string | null;
}

export default function CustomSearchHeader({
  title = "Comercios",
  icon,
}: CustomSearchHeaderProps) {
  const dispatch = useAppDispatch();
  const { addresses, selectedAddressId } = useAppSelector((s) => s.addresses);
  const cartCount = useAppSelector(selectCartCount);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const displayAddress = useMemo(() => {
    if (!hydrated) return "Altos De Chavon"; // Mock default for SSR/Initial
    if (!addresses || !selectedAddressId) return "Seleccionar dirección";
    const selected = addresses.find((a) => (a.id as any) === selectedAddressId);
    if (selected) {
      const label = (selected.location_type as string)?.toUpperCase?.() || "";
      // Clean simple display for header
      return (
        `${label} ${selected.location_number || ""}`.trim() ||
        (selected as any).address ||
        "Dirección"
      );
    }
    return "Seleccionar dirección";
  }, [addresses, selectedAddressId, hydrated]);

  return (
    <>
      {/* Spacer to push content down. Layout gives 64px (pt-16), Header is ~96px. Need ~32px extra. */}
      <div className="md:hidden h-[32px] w-full" />

      <div className="fixed top-0 left-0 right-0 z-[60] bg-white pt-2 pb-3 px-4 flex flex-col gap-3 md:hidden shadow-sm">
        {/* Row 1: Centered Address Trigger */}
        <div className="flex justify-center w-full py-5">
          <button
            onClick={() => dispatch(toggleAddressSlider())}
            className="flex items-center gap-1"
          >
            <span className="text-[14px] font-bold text-black font-[Poppins]">
              {displayAddress}
            </span>
            <ChevronDown size={14} className="text-black" />
          </button>
        </div>

        {/* Row 2: Title and Actions */}
        <div className="flex items-center justify-between w-full">
          {/* Left: Title & Icon */}
          <div className="flex items-center gap-2">
            {icon && (
              <div className="relative w-6 h-6">
                <Image src={icon} alt={title} fill className="object-contain" />
              </div>
            )}
            <h1 className="text-xl font-bold text-black font-[Poppins] tracking-tight">
              {title}
            </h1>
          </div>

          {/* Right: Actions (User, Home, Cart) */}
          <div className="flex items-center gap-3">
            {/* Profile */}
            <Link href="/user/profile">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Image
                  src="/new-design/nd-user.png"
                  width={18}
                  height={18}
                  alt="Perfil"
                />
              </div>
            </Link>

            {/* Home */}
            <Link href="/user/home">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Home className="w-5 h-5 text-black" />
              </div>
            </Link>

            {/* Cart Button */}
            <button
              className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              onClick={() => dispatch(toggleCart())}
              aria-label="Abrir carrito"
            >
              <div className="relative">
                <Image
                  src="/new-design/nd-cart.png"
                  width={24}
                  height={24}
                  alt="Carrito"
                />
                <div className="absolute -top-2 -right-2">
                  <Badge
                    count={cartCount}
                    color="bg-red-500"
                    className="rounded-full shadow-sm ring-2 ring-white"
                  />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
