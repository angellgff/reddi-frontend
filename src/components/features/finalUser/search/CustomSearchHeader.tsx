"use client";

import { useAppSelector, useAppDispatch } from "@/src/lib/store/hooks";
import { toggleAddressSlider } from "@/src/lib/store/uiSlice";
import { ChevronDown, Bell, User } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

export default function CustomSearchHeader() {
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
      // Construct address similar to UserHeader logic
      // Assuming location_type and location_number exist or similar.
      // UserHeader: `${label} ${selected.location_number}`
      const label = (selected.location_type as string)?.toUpperCase?.() || "";
      return (
        `${label} ${selected.location_number || ""}`.trim() ||
        selected.address ||
        "Dirección"
      );
    }
    return "Seleccionar dirección";
  }, [addresses, selectedAddressId, hydrated]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-white h-[70px] px-4 flex items-center justify-between md:hidden shadow-sm">
      {/* Address Trigger */}
      <button
        onClick={() => dispatch(toggleAddressSlider())}
        className="flex flex-col items-start pt-4"
      >
        <div className="flex items-center gap-1">
          <span className="text-[15px] font-bold text-black font-[Poppins]">
            {displayAddress}
          </span>
          <ChevronDown
            size={16}
            className="text-black bg-gray-100 rounded-full p-[2px]"
          />
        </div>
      </button>

      {/* Right Icons */}
      <div className="flex items-center gap-4 pt-4">
        {/* Bell */}
        <div className="relative w-[30px] h-[30px] flex items-center justify-center bg-gray-100 rounded-full">
          <Bell size={16} className="text-black" />
          <span className="absolute top-[2px] right-[2px] w-[8px] h-[8px] bg-yellow-400 rounded-full border border-white"></span>
        </div>

        {/* Profile */}
        <Link href="/user/profile">
          <div className="w-[30px] h-[30px] bg-gray-200 rounded-full overflow-hidden border border-gray-300">
            {/* Abstract user icon or image if available. Just using icon for now to match style */}
            <User className="w-full h-full p-1 text-gray-500" />
          </div>
        </Link>
      </div>
    </div>
  );
}
