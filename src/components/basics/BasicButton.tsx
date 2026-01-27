import React from "react";

interface LinkButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function BasicButton({
  children,
  className,
  type = "button",
  disabled = false,
  onClick,
}: LinkButtonProps) {
  return (
    <button
      className={
        disabled
          ? `flex items-center justify-center opacity-50 rounded-2xl border cursor-not-allowed ${className}`
          : `flex items-center justify-center transition-colors duration-500 border-mainBorder rounded-2xl border group  ${className}`
      }
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
