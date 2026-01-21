import { ReactNode } from "react";

interface PartnerAuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function PartnerAuthInput({
  label,
  id,
  className = "",
  error,
  ...props
}: PartnerAuthInputProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-[#47BB7E] font-bold text-base mb-2"
        style={{ fontFamily: "Open Sans, sans-serif" }}
      >
        {label}
      </label>
      <input
        id={id}
        className={`w-full h-[46px] bg-[#F4F5F7] border-none rounded-lg px-4 text-[#484848] text-[13px] focus:ring-2 focus:ring-[#04BD88] outline-none placeholder:text-[#484848]/50 ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
