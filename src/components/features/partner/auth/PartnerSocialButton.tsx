import { ReactNode } from "react";

interface PartnerSocialButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

export default function PartnerSocialButton({
  onClick,
  icon,
  label,
}: PartnerSocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full pl-0 px-4 py-2 hover:bg-gray-50 transition-colors"
    >
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <span className="text-xs font-bold text-[#1C1C1C]">{label}</span>
    </button>
  );
}
