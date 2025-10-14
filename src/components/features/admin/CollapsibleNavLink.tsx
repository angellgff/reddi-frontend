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
  const IconComp = link.icon ?? Squares2X2Icon;
  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-lg p-3 text-sm font-medium ${
          isOpen
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center space-x-3">
          <IconComp className="h-5 w-5" />
          <span>{link.name}</span>
        </div>
        <ChevronIcon
          className={`h-4 w-4 text-gray-500 transition-transform ${
            !isOpen && "rotate-180"
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-1 space-y-1 pl-6">
          {link.subLinks?.map((subLink) => {
            const SubIcon = subLink.icon ?? Squares2X2Icon;
            const isActive = activeSubLink.startsWith(subLink.href);
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
                <SubIcon className="h-4 w-4" />
                <span>{subLink.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
