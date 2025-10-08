// components/Header.tsx

"use client";

import Badge from "@/src/components/basics/header/Badge";
import Logo from "@/src/components/basics/Logo";
import UserCarIcon from "@/src/components/icons/UserCarIcon";
import BurgerButton from "@/src/components/features/layout/BurgerButton";
import GuestMenu from "@/src/components/features/main/GuestMenu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import BasicButton from "@/src/components/basics/LinkButton";
import LoginIcon from "@/src/components/icons/LoginIcon";

const badgeColor = "bg-primary";
const primary = "#00A86B";
const menuLinksData = [
  { label: "Delivery gratis", href: "/" },
  { label: "Ofertas", href: "/" },
  { label: "Desayuno", href: "/" },
  { label: "Almuerzo", href: "/" },
  { label: "Cena", href: "/" },
  { label: "login", href: "/login" },
];

export default function GuestHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const showSearchBar = pathname === "/";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si el usuario está cerca de la parte superior, siempre muestra la barra
      if (currentScrollY < 10) {
        setIsSearchBarVisible(true);
      }
      // Si el scroll es hacia abajo, oculta la barra
      else if (currentScrollY > lastScrollY) {
        setIsSearchBarVisible(false);
        setIsMenuOpen(isMenuOpen && false);
      }
      // Si el scroll es hacia arriba, muestra la barra
      else {
        setIsSearchBarVisible(true);
        setIsMenuOpen(isMenuOpen && false);
      }

      // Actualiza la última posición del scroll
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, isMenuOpen, isClient]);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        text-white
       
        pt-safe 
        overflow-hidden
        ${showSearchBar && "rounded-b-xl"}
      `} // INSTALAR EL PLUGIN PARA EL PTSAFE
    >
      <div
        className="
          absolute inset-0
          bg-white
          -z-10
        "
      ></div>
      <div
        className={`flex flex-col p-4 ${isSearchBarVisible ? "space-y-4" : ""}`}
      >
        {/* --- Fila Superior: Logo y Acciones --- */}
        <div className="flex items-end justify-between md:items-center">
          {/* Lado Izquierdo: Logo */}
          <Link href="/">
            <Logo fill={primary} />
          </Link>

          {/* Lado Derecho: Iconos de Acción */}
          <div className="flex items-center space-x-4 sm:hidden">
            <button className="relative">
              <UserCarIcon fill="#000000" />
              <Badge count={1} color={badgeColor} className="rounded-full" />
            </button>
            <BurgerButton isOpen={isMenuOpen} onClick={toggleMenu} />
          </div>
          <div className="hidden sm:flex sm:items-center font-roboto sm:space-x-4">
            <span className="text-black">¿Ya tienes cuenta?</span>
            <BasicButton
              href="/login"
              className="px-6 py-2 md:flex bg-black text-white hover:bg-primary hover:border-primary hover:text-black"
            >
              <LoginIcon className="text-primary group-hover:text-black"></LoginIcon>
              <span className="font-medium text-sm">Iniciar Sesión</span>
            </BasicButton>
          </div>
        </div>

        {/* --- Fila Inferior: Búsqueda y Filtros --- */}
        {showSearchBar && <SearchBar isVisible={isSearchBarVisible} />}
      </div>
      <GuestMenu
        isOpen={isMenuOpen}
        myOnClick={toggleMenu}
        linksData={menuLinksData}
      />
    </header>
  );
}
