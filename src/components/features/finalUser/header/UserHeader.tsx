// components/Header.tsx

"use client";

import { ChevronDown, ShoppingBag, Heart, MapPin } from "lucide-react";

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
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { selectCartOpen, toggleCart, closeCart } from "@/src/lib/store/uiSlice";
import { selectCartCount } from "@/src/lib/store/cartSlice";

const badgeColor = "bg-red-500";

export default function Header({ userData }: { userData: UserHeaderData }) {
  const [lastScrollY, setLastScrollY] = useState(0); // Para saber si el usuario está scrolleando
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true); // Para mostrar/ocultar la barra de búsqueda según el scroll
  const [isClient, setIsClient] = useState(false); //Para verificar si se renderizó en el cliente
  const [hydrated, setHydrated] = useState(false); // marca cuando ya podemos usar estados del cliente sin riesgo de mismatch
  const [isAddressMenuVisible, setIsAddressMenuVisible] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  useAppSelector(selectCartOpen); // read to subscribe; value not used directly here
  const cartCount = useAppSelector(selectCartCount);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleAddressMenu = () => {
    setIsAddressMenuVisible(!isAddressMenuVisible);
  };

  const onToggleCart = () => dispatch(toggleCart());

  useEffect(() => {
    setIsClient(true);
    // Defer cart count swapping to next tick to ensure initial server text coincide
    setHydrated(true);
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
      />
      <CartSlider onClose={() => dispatch(closeCart())} />

      {/* Mobile Header */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 lg:hidden
          text-white
          rounded-b-3xl shadow-lg
          pt-safe
          overflow-hidden
        `}
      >
        <div className="absolute inset-0 bg-primary -z-10">
          <div className="absolute inset-0 bg-pattern-food bg-repeat opacity-20" />
        </div>
        <div
          className={`flex flex-col p-4 ${
            isSearchBarVisible ? "space-y-4" : ""
          }`}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs opacity-90">{userData.userName}</p>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">
                  {userData.address[0].address}
                </h1>
                <button
                  onClick={toggleAddressMenu}
                  aria-label="Cambiar dirección"
                >
                  <ChevronDown
                    size={20}
                    className={`bg-white text-primary rounded-full transition-transform duration-300 ${
                      isAddressMenuVisible && "-rotate-90"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative" aria-label="Notificaciones">
                <BellIcon fill="white" />
                <Badge
                  count={userData.notificationCount}
                  color={badgeColor}
                  className="rounded-full"
                />
              </button>
              <button
                className="relative"
                onClick={onToggleCart}
                aria-label="Abrir carrito"
              >
                <UserCarIcon />
                <Badge
                  count={cartCount || userData.carCount}
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
          <div
            className={`flex items-center gap-3 transition-all duration-500 ease-in-out ${
              isSearchBarVisible
                ? "max-h-20 opacity-100 translate-y-0"
                : "max-h-0 opacity-0 -translate-y-full invisible"
            }`}
          >
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <SearchIcon />
              </div>
              <input
                type="search"
                placeholder="Busca 'Refresco'"
                className="w-full rounded-full border-none bg-white py-3 pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <button
              className="flex h-12 w-14 flex-shrink-0 items-center justify-center rounded-3xl bg-white shadow-md"
              aria-label="Filtros"
            >
              <FiltersIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:block w-full bg-white border-b border-primary relative z-40">
        <div className="mx-auto max-w-[1440px] px-12 flex h-[104px] items-center justify-between gap-10">
          {/* Left group: Logo (placeholder) + user/address */}
          <div className="flex items-center gap-10">
            <div className="flex items-center">
              {/* Placeholder for logo - replace with real Logo component if available */}
              <span className="text-3xl font-bold text-primary select-none">
                Reddi
              </span>
            </div>
            <div className="flex items-center gap-10 border-l border-primary pl-8">
              <div className="flex flex-col w-[151px]">
                <span className="text-[12px] leading-4 font-medium font-[Poppins] text-black">
                  {userData.userName}
                </span>
                <div className="flex items-end gap-2 h-5">
                  <span className="text-[16px] leading-5 font-bold font-[Poppins] text-black truncate max-w-[120px]">
                    {userData.address[0].address}
                  </span>
                  <button
                    onClick={toggleAddressMenu}
                    aria-label="Cambiar dirección"
                    className="flex items-center justify-center w-5 h-5 bg-[#CDF7E7] rounded-full text-primary"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${
                        isAddressMenuVisible && "-rotate-90"
                      }`}
                    />
                  </button>
                </div>
              </div>
              {/* Nav pills */}
              <div className="flex items-center gap-5 border-l border-primary pl-6">
                <NavPill
                  icon={<ShoppingBag size={20} />}
                  label="Mis pedidos"
                  active
                />
                <NavPill icon={<Heart size={20} />} label="Favoritos" />
                <NavPill
                  icon={<MapPin size={20} />}
                  label="Direcciones guardadas"
                />
              </div>
            </div>
          </div>
          {/* Right group: Cart + bell + user */}
          <div className="flex items-center gap-6">
            <button
              onClick={onToggleCart}
              className="relative flex items-center text-[17px] font-normal font-[Rubik]"
              aria-label="Abrir carrito"
            >
              <div className="flex items-center gap-2">
                <UserCarIcon />
                <span className="whitespace-nowrap" suppressHydrationWarning>
                  {/* Usamos el snapshot del server (userData.carCount) hasta estar hidratados */}
                  Tu carrito (
                  {hydrated
                    ? cartCount || userData.carCount || 0
                    : userData.carCount || 0}
                  )
                </span>
              </div>
            </button>
            <div className="flex items-center gap-6">
              <IconSquareButton aria-label="Notificaciones">
                <div className="relative">
                  <BellIcon />
                  <Badge
                    count={userData.notificationCount}
                    color={badgeColor}
                    className="rounded-full absolute -top-1 -right-1"
                  />
                </div>
              </IconSquareButton>
              <IconSquareButton
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                onClick={handleLogout}
              >
                <LogoutHeaderIcon />
              </IconSquareButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Small reusable pill component for desktop navigation
function NavPill({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex flex-col justify-center items-center px-2 py-1 gap-1 h-9 rounded-[10px] bg-gray-100/70 min-w-[117px] ${
        active ? "ring-2 ring-transparent" : ""
      }`}
    >
      <div className="flex items-start gap-1 h-5">
        {icon}
        <span className="text-[16px] leading-5 font-medium font-[Poppins] text-black text-center">
          {label}
        </span>
      </div>
      <div
        className={`w-full h-[2px] rounded-[1px] ${
          active ? "bg-primary" : "bg-transparent"
        }`}
      />
    </button>
  );
}

function IconSquareButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`relative w-11 h-11 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:shadow-sm transition-colors ${
        rest.className || ""
      }`}
    >
      {children}
    </button>
  );
}
