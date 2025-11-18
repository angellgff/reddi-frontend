// src/components/features/repartidor/layout/RepartidorNavMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, User } from "lucide-react"; // Iconos para un look más profesional

// Define los elementos del menú para que sea fácil de mantener
const navItems = [
  { href: "/repartidor/home", label: "Pedidos Activos", icon: Home },
  { href: "/repartidor/historial", label: "Mi Historial", icon: History },
  { href: "/repartidor/perfil", label: "Mi Perfil", icon: User },
];

export default function RepartidorNavMenu() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-10 mb-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo o Nombre de la App */}
          <div className="flex-shrink-0">
            <Link
              href="/repartidor/home"
              className="text-primary font-bold text-2xl"
            >
              ReparteYa
            </Link>
          </div>

          {/* Menú principal */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors duration-300 pb-1 ${
                  // Resalta el enlace si la ruta coincide
                  pathname === item.href
                    ? "font-semibold text-primary border-b-2 border-primary"
                    : "font-medium"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Botón de cerrar sesión u otro */}
          <div className="hidden md:block">
            <button className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
