"use client";

import { useAppSelector, useAppDispatch } from "@/src/lib/store/hooks";
import { toggleAddressSlider } from "@/src/lib/store/uiSlice";
import { ChevronDown, Bell, User, ShoppingCart } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

          {/* Right: Actions (User, Bell, Cart) */}
          <div className="flex items-center gap-3">
            {/* Profile */}
            <Link href="/user/profile">
              <div className="w-[36px] h-[36px] flex items-center justify-center bg-gray-50 rounded-full">
                <User size={20} className="text-black" />
              </div>
            </Link>

            {/* Bell */}
            <div className="relative w-[36px] h-[36px] flex items-center justify-center bg-gray-50 rounded-full">
              <Bell size={20} className="text-black" />
            </div>

            {/* Cart */}
            <Link href="/user/cart">
              <div className="w-[36px] h-[36px] flex items-center justify-center bg-gray-50 rounded-full">
                <ShoppingCart size={20} className="text-black" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
