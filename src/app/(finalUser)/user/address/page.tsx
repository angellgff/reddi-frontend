import { getUserAddressesAndSelected } from "@/src/lib/finalUser/addresses/actions";
import Link from "next/link";
import { ChevronRight, MapPin, Pencil } from "lucide-react";
import React from "react";
import AddressClientHooks from "@/src/components/features/finalUser/profile/address/AddressClientHooks";

export const dynamic = "force-dynamic";

export default async function AddressPage() {
  const { addresses } = await getUserAddressesAndSelected();

  return (
    <>
      <AddressClientHooks />
      <div className="hidden md:block mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-xl font-semibold">Direcciones</h1>
        <p className="text-sm text-gray-600 mt-2">
          Gestiona tus direcciones desde tu perfil.
        </p>
        <Link
          href="/user/profile"
          className="text-emerald-600 hover:underline mt-4 block"
        >
          Ir a Mi Perfil
        </Link>
      </div>

      {/* Mobile View */}
      <div className="md:hidden min-h-screen bg-transparent pt-[165px] px-6 pb-20 font-sans">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="relative w-[30px] h-[30px] flex items-center justify-center">
            {/* The visual shows a simple location pin */}
            <MapPin className="w-7 h-7 text-black fill-black" />
          </div>
          <h1 className="text-[20px] font-bold text-black font-open-sans leading-tight">
            Direcciones guardadas
          </h1>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4 relative z-10 font-open-sans">
          {addresses.map((addr) => (
            <Link
              key={addr.id}
              href={`/user/create-address?edit=${addr.id}`}
              className="block"
            >
              <div className="w-full h-[64px] bg-white rounded-2xl flex items-center px-5 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-gray-50 justify-between">
                <div className="flex items-center gap-4 overflow-hidden">
                  <MapPin className="w-5 h-5 text-black shrink-0" />
                  <span className="text-[16px] font-semibold text-black truncate">
                    {formatAddressLabel(addr)}
                  </span>
                </div>
                {/* Arrow right inside a small circle or styled? Screenshot just shows arrow. The CSS mentions chevron right */}
                <span className="w-6 h-6 rounded-full border border-black flex items-center justify-center shrink-0">
                  <ChevronRight className="w-3 h-3 text-black" />
                </span>
              </div>
            </Link>
          ))}

          {/* New Address */}
          <Link href="/user/profile/create-address" className="block">
            <div className="w-full h-[64px] bg-white rounded-2xl flex items-center px-5 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-gray-50 justify-between">
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
          </Link>
        </div>
      </div>
    </>
  );
}

function formatAddressLabel(addr: any) {
  if (addr.address) return addr.address;
  if (addr.location_type && addr.location_number) {
    return `${
      addr.location_type.charAt(0).toUpperCase() + addr.location_type.slice(1)
    } #${addr.location_number}`;
  }
  return "Dirección";
}
