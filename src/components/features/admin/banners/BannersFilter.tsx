"use client";

import React from "react";
import BasicInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";

type BannersFilterProps = {
  fromDate: string;
  toDate: string;
  status: string;
  onFromDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFilter: () => void;
  onClearFilters: () => void;
  disabled?: boolean;
};

const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

export default function BannersFilter({
  fromDate,
  toDate,
  status,
  onFromDateChange,
  onToDateChange,
  onStatusChange,
  onFilter,
  onClearFilters,
  disabled = false,
}: BannersFilterProps) {
  return (
    <div className="bg-white p-6 rounded-xl">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 font-montserrat">
        Filtros
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <BasicInput
          id="from-date"
          type="date"
          label="Desde"
          value={fromDate}
          onChange={onFromDateChange}
          disabled={disabled}
          placeholder=""
        />
        <BasicInput
          id="to-date"
          type="date"
          label="Hasta"
          value={toDate}
          onChange={onToDateChange}
          disabled={disabled}
          placeholder=""
        />
        <SelectInput
          id="status-select"
          label="Estados"
          value={status}
          onChange={onStatusChange}
          options={statusOptions}
          getOptionValue={(opt) => opt.value}
          getOptionLabel={(opt) => opt.label}
          placeholder="Seleccione"
          disabled={disabled}
        />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClearFilters}
          className="px-5 py-2.5 text-sm font-medium text-gray-800 bg-white border border-black rounded-xl hover:bg-gray-100 focus:outline-none"
        >
          Limpiar filtros
        </button>
        <button
          onClick={onFilter}
          className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-green-700 focus:outline-none"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}
