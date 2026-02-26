// src/components/basics/dashboard/DashboardHeader.tsx

"use client";

import Image from "next/image";
import BellIcon from "@/src/components/icons/BellIcon";
import LogoutIcon from "@/src/components/icons/LogoutHeaderIcon";
import Badge from "@/src/components/basics/header/Badge";
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

  const getPageTitle = (currentPath: string | null) => {
    if (!currentPath) return "Panel";

    if (currentPath.includes("/orders")) return "Pedidos";
    if (currentPath.includes("/productos") || currentPath.includes("/menu")) {
      return "Productos / Menú";
    }
    if (currentPath.includes("/categorias")) return "Categorías";
    if (currentPath.includes("/history")) return "Historial";
    if (currentPath.includes("/support")) return "Soporte";
    if (currentPath.includes("/finances")) return "Ventas y Finanzas";
    if (currentPath.includes("/notifications")) return "Notificaciones";
    if (currentPath.includes("/profile")) return "Perfil";

    const parts = currentPath.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1] ?? "panel";
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

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
    <header className="border-b-2 border-gray-200 bg-white font-manrope">
      <div className="flex items-center justify-between px-8 py-5">
        <h1 className="text-2xl font-semibold text-[#101010]">
          {getPageTitle(pathname)}
        </h1>
        <div className="flex items-center">
          <div className="flex items-center space-x-6 px-4">
            <div className="flex items-center space-x-4">
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
                className="h-9 w-9 rounded-full object-cover"
                src={profileImageUrl}
                alt={`Logo de ${profile.business_name}`}
                width={36}
                height={36}
              />
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {profile.business_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
