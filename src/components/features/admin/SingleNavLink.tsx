import { NavLink } from "../../basics/dashboard/types";
import Link from "next/link";
import Squares2X2Icon from "@/src/components/icons/Squares2X2Icon";
import React, { ComponentType } from "react";
import { iconMap } from "../../basics/dashboard/iconsMap";

export type SingleNavLinkProps = {
  link: Omit<NavLink, "subLinks">;
  isActive: boolean;
  onClick: () => void;
};

export default function SingleNavLink({
  link,
  isActive,
  onClick,
}: SingleNavLinkProps) {
  // If an icon React element is provided, clone and style it; otherwise use string map.
  const renderIcon = () => {
    const key = typeof link.icon === "string" ? (link.icon as string) : "";
    const IconComponent = ((key && iconMap[key]) ??
      Squares2X2Icon) as ComponentType<{
      className?: string;
      fill?: string;
    }>;

    return (
      <IconComponent
        className={`h-5 w-5 ${isActive ? "text-white" : ""}`}
        fill={isActive ? "white" : undefined}
      />
    );
  };

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={`flex items-center space-x-3 rounded-lg p-3 text-sm font-medium ${
        isActive
          ? "bg-primary text-white"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {renderIcon()}
      <span>{link.name}</span>
    </Link>
  );
}
