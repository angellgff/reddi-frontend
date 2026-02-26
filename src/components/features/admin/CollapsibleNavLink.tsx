import React from "react";
import { NavLink } from "../../basics/dashboard/types";
import Link from "next/link";
import ChevronIcon from "@/src/components/icons/ChevronIcon";
import Squares2X2Icon from "@/src/components/icons/Squares2X2Icon";
import { iconMap } from "../../basics/dashboard/iconsMap";

type CollapsibleNavLinkProps = {
  link: NavLink;
  isOpen: boolean;
  activeSubLink: string;
  onToggle: () => void;
};

export default function CollapsibleNavLink({
  link,
  isOpen,
  activeSubLink,
  onToggle,
}: CollapsibleNavLinkProps) {
  const renderMainIcon = () => {
    const active = isOpen;
    const IconComponent =
      link.icon && iconMap[link.icon] ? iconMap[link.icon] : Squares2X2Icon;

    return (
      <IconComponent
        className={`h-5 w-5 ${active ? "text-white" : ""}`}
        fill={active ? "white" : undefined}
      />
    );
  };
  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex h-10 w-full items-center justify-between rounded-[14px] pl-4 pr-3 text-[13px] font-semibold leading-5 ${
          isOpen ? "bg-primary text-white" : "text-white hover:bg-white/10"
        }`}
      >
        <div className="flex items-center space-x-3">
          {renderMainIcon()}
          <span>{link.name}</span>
        </div>
        <ChevronIcon
          className={`h-4 w-4 transition-transform ${
            !isOpen ? "rotate-180 text-white/60" : "text-white"
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-1 space-y-1 pl-6">
          {link.subLinks?.map((subLink) => {
            const isActive = activeSubLink.startsWith(subLink.href);
            const renderSubIcon = () => {
              const IconComponent =
                subLink.icon && iconMap[subLink.icon]
                  ? iconMap[subLink.icon]
                  : Squares2X2Icon;
              return (
                <IconComponent
                  className={`h-4 w-4 ${isActive ? "text-white" : ""}`}
                  fill={isActive ? "white" : undefined}
                />
              );
            };
            return (
              <Link
                key={subLink.name}
                href={subLink.href}
                className={`flex h-9 items-center space-x-3 rounded-[12px] px-4 py-2 text-[13px] font-semibold ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {renderSubIcon()}
                <span>{subLink.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
