// components/Header.tsx

"use client";

import { ChevronDown, ChevronLeft, Menu, X, Home } from "lucide-react";

import Badge from "@/src/components/basics/header/Badge";
import AddressSlider from "@/src/components/features/finalUser/adressSlider/AddressSlider";
// import CartSlider from "@/src/components/features/finalUser/cartSlider/CartSlider";
import { UserHeaderData } from "@/src/lib/finalUser/type";
import { useState, useEffect, useMemo } from "react";
import LogoutHeaderIcon from "@/src/components/icons/LogoutHeaderIcon";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import {
  selectCartOpen,
  toggleCart,
  selectAddressSliderOpen,
  toggleAddressSlider,
  closeAddressSlider,
} from "@/src/lib/store/uiSlice";
import { useSearchParams } from "next/navigation";
import { selectCartCount } from "@/src/lib/store/cartSlice";
import Logo from "@/src/components/basics/Logo";
import Link from "next/link";
import Image from "next/image";
import NdCartIcon from "@/src/components/icons/NdCartIcon";
import NdProfileIcon from "@/src/components/icons/NdProfileIcon";

const badgeColor = "bg-red-500";

export default function Header({ userData }: { userData: UserHeaderData }) {
  const dispatch = useAppDispatch();
  const [lastScrollY, setLastScrollY] = useState(0); // Para saber si el usuario está scrolleando
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true); // Para mostrar/ocultar la barra de búsqueda según el scroll
  const [isClient, setIsClient] = useState(false); //Para verificar si se renderizó en el cliente
  const [hydrated, setHydrated] = useState(false); // marca cuando ya podemos usar estados del cliente sin riesgo de mismatch

  // Usamos el estado global para el slider de direcciones
  const isAddressMenuVisible = useAppSelector(selectAddressSliderOpen);

  const [isNavOpen, setIsNavOpen] = useState(false); // menú hamburguesa para < xl
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useAppSelector(selectCartOpen); // read to subscribe; value not used directly here
  const cartCount = useAppSelector(selectCartCount);
  const { addresses, selectedAddressId } = useAppSelector((s) => s.addresses);

  // En tu componente Header.tsx
  const handleLogout = async () => {
    console.log("Iniciando cierre de sesión a través de la API route...");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        // Si la respuesta del servidor no fue exitosa (ej. status 500)
        const data = await response.json();
        throw new Error(data.error || "La respuesta del servidor no fue OK");
      }

      console.log("Logout request exitoso. Refrescando y redirigiendo...");

      // router.refresh() podría ser suficiente, pero una recarga completa es más segura
      // para garantizar que todo el estado del cliente (incluido Redux) se limpie.
      window.location.href = "/login";
    } catch (e) {
      console.error("Error al llamar a la API de logout:", e);
      // Opcional: Mostrar una notificación al usuario de que el logout falló.
    }
  };

  const toggleAddressMenu = () => {
    dispatch(toggleAddressSlider());
  };
  const toggleNav = () => setIsNavOpen((p) => !p);

  // Navigation helpers
  const go = (href: string) => {
    router.push(href);
    setIsNavOpen(false);
  };
  const goOrders = () => go("/user/orders");
  const goFavorites = () => go("/user/favorites");
  const goAddresses = () => go("/user/profile");

  const onToggleCart = () => dispatch(toggleCart());

  useEffect(() => {
    setIsClient(true);
    // Defer cart count swapping to next tick to ensure initial server text coincide
    setHydrated(true);
  }, []);

  const serverAddressSnapshot = userData?.address?.[0]?.address || "";
  const computedClientAddress = useMemo(() => {
    const selected = addresses.find(
      (a) => (a.id as unknown as string) === selectedAddressId,
    );
    if (selected) {
      const label = (selected.location_type as string)?.toUpperCase?.() || "";
      return `${label} ${selected.location_number}`.trim();
    }
    return serverAddressSnapshot;
  }, [addresses, selectedAddressId, serverAddressSnapshot]);
  // Keep server snapshot during hydration to avoid mismatches; switch after mount
  const displayedAddress = hydrated
    ? computedClientAddress
    : serverAddressSnapshot;

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

  if (
    pathname?.startsWith("/user/stores/") ||
    pathname === "/user/profile/create-address"
  ) {
    return null;
  }

  return (
    <>
      <AddressSlider
        isOpen={isAddressMenuVisible}
        onClose={() => dispatch(closeAddressSlider())}
      />
      {/* <CartSlider /> moved to layout to persist across store pages */}

      {/* Mobile Header */}
      {pathname?.startsWith("/user/orders/") ? null : pathname ===
          "/user/profile" ||
        pathname === "/user/orders" ||
        pathname === "/user/address" ||
        pathname === "/user/profile/settings" ? (
        <header className="absolute top-0 left-0 right-0 w-full md:hidden z-0">
          {/* Yellow Shape Background */}
          <div
            className={`absolute top-0 left-0 w-full overflow-hidden ${
              pathname === "/user/orders" ||
              pathname === "/user/address" ||
              pathname === "/user/profile/settings"
                ? "h-[160px]"
                : "h-[220px]"
            }`}
          >
            <div
              className={`absolute top-0 left-[-25%] w-[150%] bg-[#E8C500] rounded-b-[100%] shadow-sm ${
                pathname === "/user/orders" ||
                pathname === "/user/address" ||
                pathname === "/user/profile/settings"
                  ? "h-[140px]"
                  : "h-[200px]"
              }`}
            />
          </div>

          {/* Icons Row */}
          <div className="relative z-10 flex justify-between items-start px-6 pt-8 mt-2">
            <Link
              href={
                pathname === "/user/address" ||
                pathname === "/user/profile/settings"
                  ? "/user/profile"
                  : "/user/home"
              }
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6 text-black" />
            </Link>

            <div className="flex gap-3">
              <Link
                href="/user/home"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative"
              >
                <div className="relative">
                  <Home className="w-6 h-6 text-black" />
                </div>
              </Link>

              <button
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative"
                onClick={onToggleCart}
                aria-label="Abrir carrito"
              >
                <div className="relative">
                  <NdCartIcon className="w-6 h-6" />
                  <div className="absolute -top-2 -right-2">
                    <Badge
                      count={cartCount || userData.carCount}
                      color={badgeColor}
                      className="rounded-full shadow-sm ring-2 ring-white"
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </header>
      ) : (
        <header
          className={`
          absolute top-0 left-0 right-0 z-50 md:hidden
          bg-white text-black
          shadow-sm
          pt-safe
        `}
        >
          <div className="flex justify-between items-start pt-2 pb-4 px-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-black/60">
                {userData.userName}
              </span>
              <button
                onClick={toggleAddressMenu}
                aria-label="Cambiar dirección"
                className="flex items-center gap-1"
              >
                <span
                  className="text-[15px] font-bold text-black truncate max-w-[200px]"
                  suppressHydrationWarning
                >
                  {displayedAddress}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-black transition-transform duration-300 ${
                    isAddressMenuVisible && "rotate-180"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/user/profile">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <NdProfileIcon className="w-[18px] h-[24px]" />
                </div>
              </Link>

              <Link href="/user/home" className="relative">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-black" />
                </div>
              </Link>

              {/* Cart Button */}
              <button
                className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                onClick={onToggleCart}
                aria-label="Abrir carrito"
              >
                <div className="relative">
                  <NdCartIcon className="w-6 h-6" />
                  <div className="absolute -top-2 -right-2">
                    <Badge
                      count={cartCount || userData.carCount}
                      color={badgeColor}
                      className="rounded-full shadow-sm ring-2 ring-white"
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block w-full bg-white border-b border-primary relative z-40">
        <div className="mx-auto w-full max-w-[1400px] xl:max-w-[1280px] 2xl:max-w-7xl px-6 lg:px-10 xl:px-12 flex h-[88px] lg:h-[104px] items-center justify-between gap-6 lg:gap-10">
          {/* Left group: Logo (placeholder) + user/address */}
          <div className="flex items-center gap-6 lg:gap-10 min-w-0">
            <div className="flex items-center flex-shrink-0">
              {/* Placeholder for logo - replace with real Logo component if available */}
              <Link href="/user/home">
                <Logo />
              </Link>
            </div>
            <div className="flex items-center gap-6 lg:gap-10 border-l border-primary pl-4 lg:pl-8 min-w-0">
              <div className="flex flex-col w-[151px] flex-shrink-0">
                <span className="text-[12px] leading-4 font-medium font-[Poppins] text-black">
                  {userData.userName}
                </span>
                <div className="flex items-end gap-2 h-5">
                  <span
                    className="text-[16px] leading-5 font-bold font-[Poppins] text-black truncate max-w-[120px]"
                    title={displayedAddress}
                  >
                    <span suppressHydrationWarning>{displayedAddress}</span>
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
              {/* Nav pills solo visibles en >= xl */}
              <div className="hidden xl:flex items-center gap-5 border-l border-primary pl-6 flex-shrink min-w-0">
                <NavPill
                  iconSrc="/new-design/nd-bag.png"
                  label="Mis pedidos"
                  active={Boolean(pathname?.startsWith("/user/orders"))}
                  onClick={goOrders}
                />
                <NavPill
                  iconSrc="/new-design/nd-heart.png"
                  label="Favoritos"
                  active={pathname === "/user/favorites"}
                  onClick={goFavorites}
                />
                <NavPill
                  iconSrc="/new-design/nd-map.png"
                  label="Direcciones guardadas"
                  active={pathname === "/user/profile"}
                  onClick={goAddresses}
                />
              </div>
            </div>
          </div>
          {/* Right group: Cart + bell + user */}
          <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
            <button
              onClick={onToggleCart}
              className="relative hidden xl:flex items-center text-[17px] font-normal font-[Rubik]"
              aria-label="Abrir carrito"
            >
              <div className="flex items-center gap-2">
                <NdCartIcon className="w-5 h-5" />
                <span
                  className="whitespace-nowrap text-sm lg:text-base"
                  suppressHydrationWarning
                >
                  {/* Usamos el snapshot del server (userData.carCount) hasta estar hidratados */}
                  Tu carrito (
                  {hydrated
                    ? cartCount || userData.carCount || 0
                    : userData.carCount || 0}
                  )
                </span>
              </div>
            </button>
            <div className="hidden xl:flex items-center gap-4 lg:gap-6">
              <IconSquareButton
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                onClick={handleLogout}
              >
                <LogoutHeaderIcon />
              </IconSquareButton>
            </div>
            {/* Botón hamburguesa se mueve al extremo derecho para < xl */}
            <button
              type="button"
              onClick={toggleNav}
              aria-label="Abrir menú"
              className="xl:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {isNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {/* Drawer nav para < xl */}
        {isNavOpen && (
          <div className="xl:hidden absolute right-0 top-full bg-white shadow-md border border-gray-200 rounded-b-xl z-50 w-72 animate-slide-down">
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <NavPill
                  iconSrc="/new-design/nd-bag.png"
                  label="Mis pedidos"
                  active={Boolean(pathname?.startsWith("/user/orders"))}
                  onClick={goOrders}
                />
                <NavPill
                  iconSrc="/new-design/nd-heart.png"
                  label="Favoritos"
                  active={pathname === "/user/favorites"}
                  onClick={goFavorites}
                />
                <NavPill
                  iconSrc="/new-design/nd-map.png"
                  label="Direcciones guardadas"
                  active={pathname === "/user/profile"}
                  onClick={goAddresses}
                />
              </div>
              <div className="h-px bg-gray-200" />
              {/* Acciones que se ocultaron inline */}
              <button
                onClick={onToggleCart}
                className="flex items-center justify-between w-full text-sm font-medium px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <span>Carrito</span>
                <div className="relative">
                  <Image
                    src="/nd-cart.png"
                    width={20}
                    height={20}
                    alt="Carrito"
                  />
                  <Badge
                    count={
                      hydrated
                        ? cartCount || userData.carCount || 0
                        : userData.carCount || 0
                    }
                    color={badgeColor}
                    className="rounded-full"
                  />
                </div>
              </button>
              <IconSquareButton
                aria-label="Cerrar sesión"
                onClick={handleLogout}
                className="w-full justify-start px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <LogoutHeaderIcon />
                  <span className="text-sm">Cerrar sesión</span>
                </div>
              </IconSquareButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Small reusable pill component for desktop navigation
function NavPill({
  iconSrc,
  label,
  active = false,
  onClick,
}: {
  iconSrc: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col justify-center items-center px-2 py-1 gap-1 h-9 rounded-[10px] bg-gray-100/70 min-w-[117px] ${
        active ? "ring-2 ring-transparent" : ""
      }`}
    >
      <div className="flex items-center gap-1 h-5">
        <Image src={iconSrc} width={15} height={15} alt={label} />
        <span className="text-[14px] leading-5 font-medium font-[Poppins] text-black text-center">
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
