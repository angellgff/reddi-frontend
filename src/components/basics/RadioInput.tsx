"use client";

import React from "react";

type RadioButtonProps = {
  id?: string;
  name: string;
  value: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  label: string;
  className?: string;
  readOnly?: boolean;
};

export default function RadioButton({
  id,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  label,
  className = "",
  readOnly = false,
}: RadioButtonProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center cursor-pointer ${className}`}
    >
      {/* 1. EL INPUT REAL: Se oculta visualmente pero sigue ahí */}
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled || readOnly}
        readOnly={readOnly}
        className={`sr-only peer ${
          disabled && "text-gray-400 cursor-not-allowed"
        }`}
      />

      <span
        className={`
          w-5 h-5 
          border-2 border-[#D9DCE3] rounded-full 
          grid place-items-center
          transition-colors duration-200
          peer-checked:border-primary
          peer-checked:border-[4px]
          peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary
          peer-disabled:cursor-not-allowed
        `}
      >
        {/* 3. EL FALSO RADIO BUTTON (EL PUNTO INTERIOR) */}
        <span
          className={`
            w-2.5 h-2.5 
            bg-primary rounded-full
            transition-transform duration-200
            transform scale-0

            peer-checked:scale-100
          `}
        />
      </span>

      {/* La etiqueta de texto */}
      <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}
