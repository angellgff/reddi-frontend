import React from "react";
import InputNotice from "./InputNotice";

type SelectInputProps<T> = {
  id: string;
  label?: string;
  options: T[]; // Un array de cualquier tipo de objeto
  getOptionValue: (option: T) => string | number; // Función para obtener el valor del <option>
  getOptionLabel: (option: T) => string; // Función para obtener el texto visible del <option>
  value: string; // El valor seleccionado actualmente (controlado por el padre)
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Función que se ejecuta al cambiar
  placeholder?: string;
  className?: string;
  name?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
};

export default function SelectInput<T>({
  id,
  label,
  options,
  getOptionValue,
  getOptionLabel,
  value,
  onChange,
  placeholder,
  className = "",
  name = id,
  required,
  error,
  disabled = false,
}: SelectInputProps<T>) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1 font-roboto"
      >
        {label && label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`block w-full rounded-xl border border-[#D9DCE3] sm:text-sm p-2 font-roboto ${
          error && "border-error"
        } ${disabled && "text-gray-400 cursor-not-allowed"}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const optionValue = getOptionValue(option);
          const optionLabel = getOptionLabel(option);
          return (
            <option key={String(optionValue)} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error && <InputNotice variant="error" msg={error} />}
    </div>
  );
}
