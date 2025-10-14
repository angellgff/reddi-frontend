"use client";

import LogoutAsideIcon from "@/src/components/icons/LogoutAsideIcon";
import CollapsibleNavLink from "../../features/admin/CollapsibleNavLink";
import SingleNavLink from "../../features/admin/SingleNavLink";
import { ReactNode, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";

export type NavLink = {
  name: string;
  href: string;
  icon?: string; // Un identificador de texto para el icono
  subLinks?: Omit<NavLink, "subLinks">[];
};

export default function Sidebar({
  navigationLinks,
}: {
  navigationLinks: NavLink[];
}) {
  const pathname = usePathname();

  // Helper: determine if link is active for current route
  const isLinkActive = (href: string) => {
    if (!href) return false;
    // Exact match first
    if (pathname === href) return true;
    // Otherwise check if current path is under the link base path
    const base = href.endsWith("/") ? href : `${href}/`;
    return pathname.startsWith(base);
  };

  const [openMenu, setOpenMenu] = useState(() => {
    const currentLink = navigationLinks.find((link) =>
      link.subLinks?.some((sub) => isLinkActive(sub.href))
    );
    return currentLink?.name || "";
  });

  return (
    <aside className="fixed w-[14rem] h-screen flex-col bg-white pt-[86px] -translate-x-full md:translate-x-0">
      <div className="flex flex-col p-4 h-full justify-between">
        {/* Navegación Principal */}
        <nav className="space-y-2">
          {navigationLinks.map((link) => {
            if (link.subLinks) {
              const isMenuActive = link.subLinks.some((sub) =>
                isLinkActive(sub.href)
              );
              return (
                <CollapsibleNavLink
                  key={link.name}
                  link={link}
                  // El menú está abierto si su nombre coincide con el estado O si está activo
                  isOpen={openMenu === link.name || isMenuActive}
                  activeSubLink={pathname}
                  onToggle={() =>
                    setOpenMenu(openMenu === link.name ? "" : link.name)
                  }
                />
              );
            }

            const isActive = isLinkActive(link.href);

            return (
              <SingleNavLink
                key={link.name}
                link={link}
                isActive={isActive}
                onClick={() => setOpenMenu("")}
              />
            );
          })}
        </nav>

        {/* Botón de Logout */}
        <div>
          <button
            className="
              flex w-full items-center rounded-lg 
              bg-gray-50 p-3 text-sm font-medium text-gray-600
              hover:bg-gray-100 hover:text-gray-900
            "
          >
            <LogoutAsideIcon className="h-5 w-5 mx-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
