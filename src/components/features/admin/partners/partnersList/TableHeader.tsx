"use client";

import React from "react";
import SortButton from "./SortButton";
import { Restaurant, OrderDir, Sortables } from "@/src/lib/admin/type";

const headerNames: Array<
  Partial<Record<keyof Restaurant | "actions", string>>
> = [
  { id: "Id aliado" },
  { name: "Nombre del negocio" },
  { nit: "NIT" },
  { address: "Dirección" },
  { type: "Tipo de Negocio" },
  { totalOrders: "Total Pedidos" },
  { state: "Estado" },
  { actions: "Acciones" },
];

const headerSortable: Sortables[] = ["id", "name", "totalOrders"];

type TableHeaderProps = {
  currentSortBy: string;
  currentSortDirection: OrderDir | null;
  onSort: (columnKey: Sortables) => void; // Callback para notificar al padre
};

export default function TableHeader({
  currentSortBy,
  currentSortDirection,
  onSort,
}: TableHeaderProps) {
  return (
    <thead className="bg-[#E7E7E7]">
      <tr>
        {headerNames.map((header) => {
          const key = Object.keys(header)[0];
          const value = Object.values(header)[0];

          const isSortableKey = headerSortable.includes(key as Sortables);
          // Determina el estado de ordenación para ESTA columna específica
          const currentSortOrder =
            key === currentSortBy ? currentSortDirection : null;

          return (
            <th
              key={key}
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-[#525252] uppercase tracking-wider truncate"
            >
              {isSortableKey ? (
                <SortButton
                  id={key}
                  name={value}
                  header={value}
                  // Cuando se hace clic, simplemente llama al callback del padre con la clave de la columna
                  onClick={() => onSort(key as Sortables)}
                  className="flex items-center gap-2 uppercase"
                  currentSortOrder={currentSortOrder}
                />
              ) : (
                <div className="flex items-center gap-2">{value}</div>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
