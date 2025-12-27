import React from "react";
import Link from "next/link";

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  disabled?: boolean;
}

export default function LinkButton({
  href,
  children,
  className,
  onClick,
  disabled = false,
}: LinkButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center justify-center transition-colors duration-500 border-mainBorder rounded-xl border group ${className}`}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
    >
      {children}
    </Link>
  );
}
