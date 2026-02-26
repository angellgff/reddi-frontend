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
      className={`flex h-10 items-center space-x-3 rounded-[14px] pl-4 text-[13px] font-semibold leading-5 ${
        isActive ? "bg-primary text-white" : "text-white hover:bg-white/10"
      }`}
    >
      {renderIcon()}
      <span>{link.name}</span>
    </Link>
  );
}
