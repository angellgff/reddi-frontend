import React from "react";
import SearchIcon from "../../icons/SearchIcon";
import FiltersIcon from "../../icons/FiltersIcon";

// Definimos los props que nuestro componente aceptará
type SearchBarProps = {
  placeholder?: string;
  onFilterClick?: () => void;
  isVisible?: boolean;
};

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Busca 'Refresco'", // Placeholder por defecto como en la imagen
  onFilterClick,
  isVisible = true,
}) => {
  return (
    <div
      className={`
                  flex items-center gap-3
                  transition-all duration-500 ease-in-out
                  ${
                    isVisible
                      ? "max-h-20 opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-full invisible"
                  }
                `}
    >
      {/* Barra de Búsqueda */}
      <div className="relative flex-grow">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <SearchIcon />
        </div>
        <input
          type="search"
          placeholder={placeholder}
          className="
                      w-full rounded-full border-none bg-white shadow-md
                      py-3 pl-11 pr-4 
                      text-gray-900 placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-green-300
                    "
        />
      </div>
      {/* Botón de Filtros */}
      <button
        onClick={onFilterClick}
        className="
                    flex h-12 w-14 flex-shrink-0 
                    items-center justify-center rounded-3xl 
                    bg-white shadow-md
                  "
      >
        <FiltersIcon />
      </button>
    </div>
  );
};

export default SearchBar;
