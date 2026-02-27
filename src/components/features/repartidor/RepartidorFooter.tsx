"use client";

import { usePathname } from "next/navigation";
import { CircleUserRound, Home, ReceiptText } from "lucide-react";
import Link from "next/link";

export default function RepartidorFooter() {
  const pathname = usePathname();

  const isHome = pathname === "/repartidor/home";
  const isOrders = pathname === "/repartidor/historial";
  const isProfile = pathname?.startsWith("/repartidor/profile");

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full border-t border-[#B2B2B2] bg-white px-8 py-2 md:hidden">
      <nav className="flex items-end justify-between">
        <Link
          href="/repartidor/home"
          className={`flex w-14 flex-col items-center justify-center ${isHome ? "text-[#13835F]" : "text-[#494949]"}`}
        >
          <Home className="h-6 w-6" />
          <span className="mt-1 text-[11px] font-bold">Home</span>
        </Link>

        <Link
          href="/repartidor/historial"
          className={`flex w-16 flex-col items-center justify-center ${isOrders ? "text-[#13835F]" : "text-[#494949]"}`}
        >
          <ReceiptText className="h-6 w-6" />
          <span className="mt-1 text-[11px] font-bold">Ordenes</span>
        </Link>

        <Link
          href="/repartidor/profile"
          className={`flex w-14 flex-col items-center justify-center ${isProfile ? "text-[#13835F]" : "text-[#494949]"}`}
        >
          <CircleUserRound className="h-6 w-6" />
          <span className="mt-1 text-[11px] font-normal">Perfil</span>
        </Link>
      </nav>
    </footer>
  );
}
