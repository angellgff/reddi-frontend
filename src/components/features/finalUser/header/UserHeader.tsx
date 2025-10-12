// components/Header.tsx

"use client";

import { ChevronDown } from "lucide-react";

import Badge from "@/src/components/basics/header/Badge";
import FiltersIcon from "@/src/components/icons/FiltersIcon";
import SearchIcon from "@/src/components/icons/SearchIcon";
import BellIcon from "@/src/components/icons/BellIcon";
import UserCarIcon from "@/src/components/icons/UserCarIcon";
import AddressSlider from "@/src/components/features/finalUser/adressSlider/AddressSlider";
import CartSlider from "@/src/components/features/finalUser/cartSlider/CartSlider";
import { UserHeaderData } from "@/src/lib/finalUser/type";
import { useState, useEffect } from "react";
import LogoutHeaderIcon from "@/src/components/icons/LogoutHeaderIcon";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

const badgeColor = "bg-red-500";

export default function Header({ userData }: { userData: UserHeaderData }) {
  const [lastScrollY, setLastScrollY] = useState(0); // Para saber si el usuario está scrolleando
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true); // Para mostrar/ocultar la barra de búsqueda según el scroll
  const [isClient, setIsClient] = useState(false); //Para verificar si se renderizó en el cliente
  const [isAddressMenuVisible, setIsAddressMenuVisible] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleAddressMenu = () => {
    setIsAddressMenuVisible(!isAddressMenuVisible);
  };

  const toggleCart = () => setIsCartOpen((v) => !v);

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
      }
      // Si el scroll es hacia arriba, muestra la barra
      else {
        setIsSearchBarVisible(true);
      }

      // Actualiza la última posición del scroll
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, isClient]);

  return (
    <>
      <AddressSlider
        isOpen={isAddressMenuVisible}
        onClose={toggleAddressMenu}
        data={userData.address}
      ></AddressSlider>
      <CartSlider isOpen={isCartOpen} onClose={toggleCart} />
      <header
        className={`
        fixed top-0 left-0 right-0 z-50
        text-white
        rounded-b-3xl shadow-lg
        pt-safe 
        overflow-hidden
      `} // INSTALAR EL PLUGIN PARA EL PTSAFE
      >
        <div
          className="
          absolute inset-0
          bg-primary
          -z-10
        "
        >
          <div
            className="
            absolute inset-0
            bg-pattern-food
            bg-repeat
            opacity-20
          "
          ></div>
        </div>
        <div
          className={`flex flex-col p-4 ${
            isSearchBarVisible ? "space-y-4" : ""
          }`}
        >
          {/* --- Fila Superior: Usuario y Acciones --- */}
          <div className="flex items-end justify-between">
            {/* Lado Izquierdo: Información del Usuario */}
            <div>
              <p className="text-xs opacity-90">{userData.userName}</p>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  {userData.address[0].address}
                </h1>
                <button onClick={toggleAddressMenu}>
                  <ChevronDown
                    size={20}
                    className={`bg-white text-primary rounded-full transition-transform duration-300 ${
                      isAddressMenuVisible && "-rotate-90"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Lado Derecho: Iconos de Acción */}
            <div className="flex items-center space-x-4">
              <button className="relative">
                <BellIcon fill="white" />
                <Badge
                  count={userData.notificationCount}
                  color={badgeColor}
                  className="rounded-full"
                />
              </button>
              <button
                className="relative"
                onClick={toggleCart}
                aria-label="Abrir carrito"
              >
                <UserCarIcon />
                <Badge
                  count={userData.carCount}
                  color={badgeColor}
                  className="rounded-full"
                />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="relative"
                title="Cerrar sesión"
              >
                <LogoutHeaderIcon fill="white" />
              </button>
            </div>
          </div>

          {/* --- Fila Inferior: Búsqueda y Filtros --- */}
          <div
            className={`
                      flex items-center gap-3
                      transition-all duration-500 ease-in-out
                      ${
                        isSearchBarVisible
                          ? "max-h-20 opacity-100 translate-y-0"
                          : "max-h-0 opacity-0 -translate-y-full invisible"
                      }
                    `}
          >
            {/* Barra de Búsqueda */}
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <SearchIcon />
              </div>
              <input
                type="search"
                placeholder="Busca 'Refresco'"
                className="
                          w-full rounded-full border-none bg-white 
                          py-3 pl-11 pr-4 
                          text-gray-900 placeholder:text-gray-400
                          focus:outline-none focus:ring-2 focus:ring-green-300
                        "
              />
            </div>
            {/* Botón de Filtros */}
            <button
              className="
                        flex h-12 w-14 flex-shrink-0 
                        items-center justify-center rounded-3xl 
                        bg-white shadow-md
                      "
            >
              <FiltersIcon />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
