import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  wrapperClassName?: string;
  containerClassName?: string;
  startIcon?: React.ReactNode;
}

export default function AuthInput({
  label,
  className = "",
  wrapperClassName = "",
  containerClassName = "",
  startIcon,
  ...props
}: AuthInputProps) {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      <label className="block text-[13px] font-bold text-black mb-[7px] leading-[18px]">
        {label}
      </label>
      <div
        className={`bg-[#F4F5F7] rounded-[8px] h-[34px] flex items-center px-4 w-full border border-transparent focus-within:border-[#04BD88] transition-colors ${containerClassName}`}
      >
        {startIcon && <div className="mr-2 flex items-center">{startIcon}</div>}
        <input
          className={`bg-transparent w-full text-[13px] text-[#484848] placeholder-[#484848] outline-none font-normal shadow-none ring-0 border-none focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none focus-visible:shadow-none !ring-0 !outline-none !border-none !shadow-none !focus:ring-0 !focus-visible:ring-0 !focus-visible:border-none ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
