import React from "react";
import InputNotice from "@/src/components/basics/InputNotice";

type SearchInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  name?: string;
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  type?: string;
  autocomplete?: string;
  readOnly?: boolean;
};

export default function BasicInput({
  id,
  label,
  placeholder = "Buscar por palabras claves",
  value,
  onChange,
  className = "",
  name = id,
  icon,
  required = false,
  error,
  disabled = false,
  type = "text",
  autocomplete = "off",
  readOnly = false,
}: SearchInputProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1 font-roboto"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name || id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`block w-full rounded-xl border-[#D9DCE3] border ${
            icon && "pl-10"
          } sm:text-sm p-2 font-roboto ${error && "border-error"} ${
            disabled && "text-gray-400 cursor-not-allowed"
          }`}
          placeholder={placeholder}
          autoComplete={autocomplete}
          readOnly={readOnly}
        />
      </div>
      {error && <InputNotice variant="error" msg={error} />}
    </div>
  );
}
