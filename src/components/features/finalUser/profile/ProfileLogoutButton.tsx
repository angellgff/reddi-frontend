"use client";

import { logoutAction } from "@/src/lib/actions/auth";
import { LogOut } from "lucide-react";

export default function ProfileLogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100"
    >
      <LogOut size={18} />
      <span>Cerrar sesión</span>
    </button>
  );
}
