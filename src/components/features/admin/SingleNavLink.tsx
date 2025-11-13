import { NavLink } from "../../basics/dashboard/DashboardAside";
import Link from "next/link";
import Squares2X2Icon from "@/src/components/icons/Squares2X2Icon";
import FinancesIcon from "../../icons/FinancesIcon";
import SupportIcon from "../../icons/SupportIcon";
import HistoryIcon from "../../icons/HistoryIcon";
import ProductIcon from "../../icons/ProductIcon";
import OrderIcon from "../../icons/OrderIcon";
import React, { ComponentType, isValidElement, cloneElement } from "react";

const iconMap: {
  [key: string]: ComponentType<{ className?: string; fill?: string }>;
} = {
  dashboard: Squares2X2Icon,
  order: OrderIcon,
  product: ProductIcon,
  history: HistoryIcon,
  support: SupportIcon,
  finances: FinancesIcon,
};

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
    if (link.icon && isValidElement(link.icon)) {
      const el = link.icon as React.ReactElement<any>;
      const prevClass = (el.props as any)?.className || "";
      const prevFill = (el.props as any)?.fill;
      const mergedProps: any = {
        className: `h-5 w-5 ${prevClass} ${isActive ? "text-white" : ""}`,
        fill: isActive ? "white" : prevFill,
      };
      return cloneElement<any>(el, mergedProps);
    }
    const key = typeof link.icon === "string" ? (link.icon as string) : "";
    const IconComponent = ((key && iconMap[key]) ??
      Squares2X2Icon) as ComponentType<{
      className?: string;
      fill?: string;
    }>;
    return (
      <IconComponent
        className="h-5 w-5"
        fill={isActive ? "white" : "#6A6C71"}
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
