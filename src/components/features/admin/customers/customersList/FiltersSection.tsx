"use client";

export default function FiltersSection({
  queryValue,
  onQueryChange,
  onFilter,
  onClearFilters,
  disabled,
}: {
  queryValue: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilter: () => void;
  onClearFilters: () => void;
  disabled?: boolean;
}) {
  return (
    <section className="bg-white rounded-2xl p-5">
      <h3 className="text-[#1F2937] text-[18px] font-semibold mb-4">Filtros</h3>
      <div className="flex flex-col gap-5">
        <div className="flex gap-5 flex-col md:flex-row">
          {/* Búsqueda */}
          <div className="flex flex-col w-full md:w-1/2 gap-2">
            <label className="text-sm text-[#292929] font-roboto">Buscar</label>
            <input
              className="h-10 px-4 border border-[#D9DCE3] rounded-xl focus:outline-none"
              placeholder="Buscar por ID, nombre, teléfono"
              value={queryValue}
              onChange={onQueryChange}
            />
          </div>
          {/* Placeholder de 'Estados' omitido por requerimiento */}
          <div className="flex flex-col w-full md:w-1/2 gap-2">
            <label className="text-sm text-[#292929] font-roboto">Estados</label>
            <input disabled className="h-10 px-4 border border-[#D9DCE3] rounded-xl bg-gray-50" placeholder="(Ignorado)" />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClearFilters}
            className="px-5 h-11 rounded-xl border border-[#202124] bg-white text-[#202124] font-poppins text-sm"
            disabled={disabled}
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={onFilter}
            className="px-5 h-11 rounded-xl bg-[#04BD88] text-white font-poppins text-sm"
            disabled={disabled}
          >
            Filtrar
          </button>
        </div>
      </div>
    </section>
  );
}
