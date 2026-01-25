"use client";

import { logoutAction } from "@/src/lib/actions/auth";
import { LogOut, ChevronRight } from "lucide-react";

export default function MobileLogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-6 h-6 relative shrink-0 flex items-center justify-center">
          <LogOut className="w-5 h-5 text-red-600" />
        </div>
        <span className="font-semibold text-sm text-red-600">Cerrar sesión</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}
