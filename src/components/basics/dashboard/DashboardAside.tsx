"use client";

import CollapsibleNavLink from "../../features/admin/CollapsibleNavLink";
import SingleNavLink from "../../features/admin/SingleNavLink";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { NavLink } from "./types";
import LogoutAsideIcon from "@/src/components/icons/LogoutAsideIcon";
import { partnerLogoutAction } from "@/src/lib/actions/auth";

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
      link.subLinks?.some((sub) => isLinkActive(sub.href)),
    );
    return currentLink?.name || "";
  });

  const handleLogout = async () => {
    await partnerLogoutAction();
  };

  return (
    <aside className="sticky top-0 z-40 hidden h-screen w-[200px] shrink-0 flex-col bg-black md:flex">
      <div className="flex h-full flex-col px-4 pb-4 pt-3">
        <div className="mb-5 px-1">
          <Image
            src="/new-design/partners.png"
            alt="Aliados"
            width={174}
            height={62}
            priority
            className="h-10 w-auto"
          />
        </div>

        <nav className="space-y-2">
          {navigationLinks.map((link) => {
            if (link.subLinks) {
              return (
                <CollapsibleNavLink
                  key={link.name}
                  link={link}
                  isOpen={openMenu === link.name}
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

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex h-[41px] items-center gap-3 rounded-[14px] pl-4 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
        >
          <LogoutAsideIcon fill="white" className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
