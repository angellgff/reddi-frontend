import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  wrapperClassName?: string;
  containerClassName?: string;
  startIcon?: React.ReactNode;
  error?: string;
}

const ErrorIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-[1px]"
  >
    <circle cx="5" cy="5" r="4.5" stroke="#CF4518" />
    <path d="M5 2.5V5.5" stroke="#CF4518" strokeLinecap="round" />
    <circle cx="5" cy="7.5" r="0.5" fill="#CF4518" />
  </svg>
);

export default function AuthInput({
  label,
  className = "",
  wrapperClassName = "",
  containerClassName = "",
  startIcon,
  error,
  ...props
}: AuthInputProps) {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      <label className="block text-[13px] font-bold text-black mb-[7px] leading-[18px]">
        {label}
      </label>
      <div
        className={`rounded-[8px] h-[34px] flex items-center px-4 w-full border transition-colors ${
          error
            ? "bg-[#FFF9E9] border-[#FFCF58]"
            : "bg-[#F4F5F7] border-transparent focus-within:border-[#04BD88]"
        } ${containerClassName}`}
      >
        {startIcon && <div className="mr-2 flex items-center">{startIcon}</div>}
        <input
          className={`bg-transparent w-full text-[13px] text-[#484848] placeholder-[#484848] outline-none font-normal shadow-none ring-0 border-none focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none focus-visible:shadow-none !ring-0 !outline-none !border-none !shadow-none !focus:ring-0 !focus-visible:ring-0 !focus-visible:border-none ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[#CF4518] text-[9px] font-semibold mt-1 flex items-center gap-1">
          <ErrorIcon /> {error}
        </span>
      )}
    </div>
  );
}
