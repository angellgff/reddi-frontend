// src/components/basics/dashboard/DashboardHeader.tsx

"use client";

import Image from "next/image";
import BellIcon from "@/src/components/icons/BellIcon";
import LogoutIcon from "@/src/components/icons/LogoutHeaderIcon";
import Badge from "@/src/components/basics/header/Badge";
import ReddiLogo from "@/src/components/icons/ReddiLogo";
import { usePathname, useRouter } from "next/navigation";
// Importamos la interfaz que definimos antes para tipar las props
import { PartnerProfile } from "@/src/lib/partner/header/data/getData";
import { partnerLogoutAction } from "@/src/lib/actions/auth";
import { useNotifications } from "@/src/lib/notifications/NotificationsContext";

// Definimos las props que recibirá el componente
interface PartnerHeaderProps {
  profile: PartnerProfile;
}

export default function PartnerHeader({ profile }: PartnerHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  if (pathname?.endsWith("/dashboard")) {
    return null;
  }

  const handleLogout = async () => {
    console.log("Iniciando cierre de sesión a través del server action...");
    try {
      await partnerLogoutAction();
    } catch (e) {
      console.error("Error al llamar a la API de logout:", e);
    }
  };

  // Usamos una imagen por defecto si no hay una URL de imagen del negocio
  const profileImageUrl =
    profile.business_image_url || "/simple-user-default.webp";

  return (
    <header className="fixed bg-white w-full font-manrope z-50">
      <div className="flex items-center">
        {/* Logo */}
        <div className="py-6 px-14 w-[14rem]">
          <ReddiLogo />
        </div>
        <div className="flex border-b-2 border-gray-200 py-6 px-[32px] grow justify-end">
          <div className="flex items-center space-x-6 px-4">
            {/* Icono de Notificaciones */}
            <div className="flex items-center space-x-4 ">
              <button
                className="relative"
                onClick={() => {
                  const target =
                    profile.role === "restaurant"
                      ? "/partner/restaurant/notifications"
                      : "/partner/market/notifications";
                  router.push(target);
                }}
                aria-label="Notificaciones"
              >
                <BellIcon fill="#454545" />
                <Badge className="rounded-sm" count={unreadCount} />
              </button>
            </div>
          </div>

          {/* Perfil de Usuario - AHORA CON DATOS DINÁMICOS */}
          <div
            className="flex items-center space-x-3 border-x-2 px-4 cursor-pointer"
            onClick={() => {
              if (profile.role === "admin" || profile.role === "superadmin") {
                router.push("/admin/profile");
                return;
              }
              const target =
                profile.role === "restaurant"
                  ? "/partner/restaurant/profile"
                  : "/partner/market/profile";
              router.push(target);
            }}
          >
            <div className="relative">
              <Image
                className="h-9 w-9 rounded-full object-cover" // Añadimos rounded-full y object-cover
                src={profileImageUrl}
                alt={`Logo de ${profile.business_name}`}
                width={36}
                height={36}
              />
              {/* Punto verde de estado "Online" */}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {profile.business_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
            </div>
          </div>

          {/* Icono de Logout */}
          <button
            type="button"
            className="rounded-full p-1 text-gray-400  px-4"
            onClick={handleLogout}
          >
            <LogoutIcon className="h-6 w-6" aria-hidden="true" fill="#454545" />
          </button>
        </div>
      </div>
    </header>
  );
}
