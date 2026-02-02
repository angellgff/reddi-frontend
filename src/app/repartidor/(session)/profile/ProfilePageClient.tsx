"use client";

import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Folder,
  Wallet,
  Bookmark,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { logoutAction } from "@/src/lib/actions/auth";

interface ProfilePageClientProps {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
}

export default function ProfilePageClient({
  firstName,
  lastName,
  email,
  avatarUrl,
}: ProfilePageClientProps) {
  const router = useRouter();
  const displayName = firstName
    ? `${firstName} ${lastName}`.trim()
    : email.split("@")[0];

  return (
    <div className="relative min-h-screen bg-white font-openSans overflow-hidden pb-24">
      {/* Curved Header Background */}
      <div
        className="absolute top-[-30px] left-[-20%] w-[140%] h-[200px] bg-[#595959]"
        style={{
          borderRadius: "0 0 50% 50%",
          transform: "scaleX(1.1)",
        }}
      />

      <div className="relative z-10 pt-12 px-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#DCDCDC]/30 text-white mb-4 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="w-[116px] h-[116px] rounded-full bg-[#D9D9D9] border-4 border-white shadow-md flex items-center justify-center overflow-hidden mb-6 relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-500" />
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-black mb-10 text-center">
            Hola, {displayName}!
          </h1>

          {/* Menu Items */}
          <div className="w-full space-y-0">
            <ProfileMenuItem
              icon={<Bookmark className="w-5 h-5 fill-current" />}
              label="Historial de propinas"
              href="/repartidor/profile/tips"
            />
            <ProfileMenuItem
              icon={<Wallet className="w-5 h-5 fill-current" />}
              label="Saldo de Efectivo"
              href="/repartidor/finanzas"
            />
            <ProfileMenuItem
              icon={<Folder className="w-5 h-5 fill-current" />}
              label="Documentos"
              href="/repartidor/documentos"
            />
            <ProfileMenuItem
              icon={<Settings className="w-5 h-5" />}
              label="Ajustes"
              href="/repartidor/profile/settings"
            />
            
            <button
              onClick={() => logoutAction()}
              className="flex items-center justify-between w-full py-5 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-5">
                <div className="text-red-500">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-[16px] font-semibold text-red-500">
                  Cerrar Sesión
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileMenuItem({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between w-full py-5 bg-white hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-5">
        <div className="text-black">{icon}</div>
        <span className="text-[16px] font-semibold text-black">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
