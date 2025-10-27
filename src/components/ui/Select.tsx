"use client";

import { Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  value: string | null;
  onChange: (v: string | null) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "Seleccione",
  className = "",
  disabled = false,
}: SelectProps) {
  const selected = options.find((o) => o.value === value) || null;

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        <ListboxButton className="flex w-full items-center justify-between h-10 px-4 border border-[#D9DCE3] rounded-[12px] bg-white text-[16px] leading-5 text-[#292929]">
          <span className={`truncate ${!selected ? "opacity-50" : ""}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="w-5 h-5 text-[#9BA1AE]" />
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-[12px] border border-[#D9DCE3] bg-white shadow-[0_16px_32px_-4px_rgba(12,12,13,0.1),_0_4px_4px_-4px_rgba(12,12,13,0.05)] focus:outline-none">
            {options.map((opt) => (
              <ListboxOption
                key={opt.value}
                value={opt.value}
                className={({ active }) =>
                  `cursor-pointer select-none px-3 py-2 text-sm ${
                    active ? "bg-gray-50" : ""
                  }`
                }
              >
                {opt.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  );
}
