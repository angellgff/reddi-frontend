// components/footer/NavItem.tsx
"use client";

import Link from "next/link";
import React from "react";
import { LucideProps } from "lucide-react";

export type NavItemProps = {
  href: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
  isActive: boolean;
  disabled?: boolean;
};

export default function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  disabled = false,
}: NavItemProps) {
  const activeTextColor = "text-green-500";
  const inactiveTextColor = disabled ? "text-gray-300" : "text-gray-500";

  const activeIconColor = "text-green-500";
  const inactiveIconColor = disabled ? "text-gray-300" : "text-gray-800";

  const shouldHighlight = !disabled && isActive;

  const baseClasses = `flex flex-col items-center justify-center gap-1 w-16 transition-opacity ${
    disabled ? "cursor-not-allowed opacity-60" : ""
  }`;

  const content = (
    <>
      <div className="relative">
        {shouldHighlight && (
          <div className="absolute -inset-1 bg-primary opacity-25 [clip-path:polygon(37%_95%,_28%_93%,_20%_87%,_12%_79%,_5%_70%,_3%_65%,_3%_55%,_3%_43%,_4%_36%,_5%_27%,_10%_18%,_17%_15%,_25%_15%,_34%_14%,_43%_15%,_50%_17%,_55%_19%,_65%_23%,_71%_26%,_78%_34%,_86%_39%,_89%_43%,_93%_50%,_94%_55%,_91%_59%,_86%_64%,_81%_69%,_71%_75%,_65%_79%,_58%_83%,_53%_87%,_46%_91%)]"></div>
        )}
        <div className="relative">
          <Icon
            size={28}
            className={`transition-colors ${
              shouldHighlight ? activeIconColor : inactiveIconColor
            }`}
            strokeWidth={shouldHighlight ? 2.5 : 2}
          />
        </div>
      </div>

      <span
        className={`text-xs font-semibold transition-colors ${
          shouldHighlight ? activeTextColor : inactiveTextColor
        }`}
      >
        {label}
      </span>

      <div
        className={`h-1 w-1 rounded-full bg-green-500 transition-opacity ${
          shouldHighlight ? "opacity-100" : "opacity-0"
        }`}
      ></div>
    </>
  );

  if (disabled) {
    return (
      <button
        type="button"
        className={baseClasses}
        aria-disabled="true"
        tabIndex={-1}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={baseClasses} aria-disabled="false">
      {content}
    </Link>
  );
}
