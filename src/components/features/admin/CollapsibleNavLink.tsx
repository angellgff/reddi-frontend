import React, { isValidElement, cloneElement } from "react";
import { NavLink } from "../../basics/dashboard/DashboardAside";
import Link from "next/link";
import ChevronIcon from "@/src/components/icons/ChevronIcon";
import Squares2X2Icon from "@/src/components/icons/Squares2X2Icon";

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
    if (link.icon && isValidElement(link.icon)) {
      const el = link.icon as React.ReactElement<any>;
      const prevClass = (el.props as any)?.className || "";
      const prevFill = (el.props as any)?.fill;
      const mergedProps: any = {
        className: `h-5 w-5 ${prevClass} ${active ? "text-white" : ""}`,
        fill: active ? "white" : prevFill,
      };
      return cloneElement<any>(el, mergedProps);
    }
    return (
      <Squares2X2Icon className={`h-5 w-5 ${isOpen ? "text-white" : ""}`} />
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
              if (subLink.icon && isValidElement(subLink.icon)) {
                const el = subLink.icon as React.ReactElement<any>;
                const prevClass = (el.props as any)?.className || "";
                const prevFill = (el.props as any)?.fill;
                const mergedProps: any = {
                  className: `h-4 w-4 ${prevClass} ${
                    isActive ? "text-white" : ""
                  }`,
                  fill: isActive ? "white" : prevFill,
                };
                return cloneElement<any>(el, mergedProps);
              }
              return (
                <Squares2X2Icon
                  className={`h-4 w-4 ${isActive ? "text-white" : ""}`}
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
