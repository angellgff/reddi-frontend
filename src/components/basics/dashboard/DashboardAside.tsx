"use client";

import LogoutAsideIcon from "@/src/components/icons/LogoutAsideIcon";
import CollapsibleNavLink from "../../features/admin/CollapsibleNavLink";
import SingleNavLink from "../../features/admin/SingleNavLink";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

export type NavLink = {
  name: string;
  href: string;
  icon?: ReactNode;
  subLinks?: Omit<NavLink, "subLinks">[];
};

export default function Sidebar({
  navigationLinks,
}: {
  navigationLinks: NavLink[];
}) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (!href) return false;
    if (pathname === href) return true;
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
        <nav className="space-y-2">
          {navigationLinks.map((link) => {
            if (link.subLinks) {
              // Ya no necesitas 'isMenuActive' aquí, pero lo dejamos por si lo usas en otro lado.
              // const isMenuActive = link.subLinks.some((sub) => isLinkActive(sub.href));

              return (
                <CollapsibleNavLink
                  key={link.name}
                  link={link}
                  // ✨ LA CORRECCIÓN ESTÁ AQUÍ ✨
                  isOpen={openMenu === link.name}
                  activeSubLink={pathname} // Sigue pasando el pathname, es correcto
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
                onClick={() => setOpenMenu("")} // Esto es bueno, cierra cualquier menú abierto
              />
            );
          })}
        </nav>

        {/* ... resto del componente ... */}
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
