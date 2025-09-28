// app/dashboard/components/FiltersSection.tsx
"use client";

import React from "react";
import SearchPartnerIcon from "@/src/components/icons/SearchPartnerIcon";
import BasicInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";

type FiltersSectionProps = {
  // Datos para los selects
  businessTypes: Array<{ value: string; label: string }>;
  states: Array<{ value: string; label: string }>;

  queryValue: string;
  typeValue: string;
  stateValue: string;

  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onStateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  onFilter: () => void;
  onClearFilters: () => void;

  disabled: boolean;
};

export default function FiltersSection({
  businessTypes,
  states,
  queryValue,
  typeValue,
  stateValue,
  onQueryChange,
  onTypeChange,
  onStateChange,
  onFilter,
  onClearFilters,
  disabled,
}: FiltersSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 font-montserrat">
        Filtros
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Input de Búsqueda */}
        <BasicInput
          id="search"
          label="Buscar"
          value={queryValue} // Recibe el valor del padre
          onChange={onQueryChange} // Notifica al padre del cambio
          placeholder="Buscar por ID, cliente, aliado..."
          icon={<SearchPartnerIcon />}
          disabled={disabled}
        />

        {/* Select de Tipo de negocio */}
        <SelectInput
          id="business-type"
          options={businessTypes}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          label="Tipo de negocio"
          placeholder="Seleccione"
          value={typeValue} // Recibe el valor del padre
          onChange={onTypeChange} // Notifica al padre del cambio
          disabled={disabled}
        />

        {/* Select de Estados */}
        <SelectInput
          id="business-state"
          options={states}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          label="Estados"
          placeholder="Seleccione"
          value={stateValue} // Recibe el valor del padre
          onChange={onStateChange} // Notifica al padre del cambio
          disabled={disabled}
        />
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClearFilters} // Notifica al padre
          className="px-5 py-2.5 text-sm font-medium text-gray-800 bg-white border border-black rounded-xl hover:bg-gray-100 focus:outline-none"
        >
          Limpiar filtros
        </button>
        <button
          onClick={onFilter} // Notifica al padre
          className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-green-700 focus:outline-none"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
}
