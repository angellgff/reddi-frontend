import React from "react";
import CheckBoxIcon from "@/src/components/icons/CheckBoxIcon";

type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string; // Para espaciado y layout
  disabled?: boolean;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "id" | "checked" | "onChange"
>;

export default function StyledCheckbox({
  id,
  label,
  checked,
  onChange,
  className = "",
  disabled = false,
  ...rest
}: CheckboxProps) {
  return (
    // Esto hace que tanto el cuadrado como el texto sean clickables.
    <label
      htmlFor={id}
      className={`inline-flex items-center cursor-pointer select-none ${className}`}
    >
      <input
        id={id}
        name={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`sr-only peer`} // sr-only lo oculta de forma accesible
        disabled={disabled}
        {...rest}
      />

      {/* 3. El cuadrado visual que creamos.*/}
      <div
        className={`
          relative flex items-center justify-center
          h-[18px] w-[18px]
          border-2 border-[#D9DCE3]
          rounded
          transition-colors duration-200 ease-in-out
          peer-checked:bg-primary
          peer-checked:border-primary
          peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary
          peer-disabled:cursor-not-allowed
        `}
      >
        {/* 4. El icono de la marca de verificación.*/}
        <CheckBoxIcon
          className={`
            h-4 w-4 text-white
            transition-transform duration-200 ease-in-out
            transform
            ${checked ? "scale-100" : "scale-0"}
          `}
        />
      </div>

      {/* 5. El texto de la etiqueta */}
      <span className="ml-3 text-sm text-gray-800">{label}</span>
    </label>
  );
}
