import { NavLink } from "../../basics/dashboard/DashboardAside";
import Link from "next/link";
import Squares2X2Icon from "@/src/components/icons/Squares2X2Icon";

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
  const IconComp = link.icon ?? Squares2X2Icon;
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
      {link.icon ?? <Squares2X2Icon className="w-5 h-5" />}
      <span>{link.name}</span>
    </Link>
  );
}
