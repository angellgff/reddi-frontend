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
        className={`flex w-full items-center justify-between rounded-lg p-3 text-sm font-medium ${
          isOpen
            ? "bg-primary text-white"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          {renderMainIcon()}
          <span>{link.name}</span>
        </div>
        <ChevronIcon
          className={`h-4 w-4 transition-transform ${
            !isOpen ? "rotate-180 text-gray-500" : "text-white"
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
                className={`flex items-center space-x-3 rounded-lg px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
