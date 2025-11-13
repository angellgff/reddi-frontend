import { OrderDir } from "@/src/lib/admin/type";

type SortKey = "id" | "name" | "phone" | "created" | "total";

export default function TableHeader({
  currentSortBy,
  currentSortDirection,
  onSort,
}: {
  currentSortBy: string | null;
  currentSortDirection: OrderDir | null;
  onSort: (k: SortKey) => void;
}) {
  const Cell = ({ label, k }: { label: string; k: SortKey }) => {
    const isActive = currentSortBy === k;
    const dir = isActive ? currentSortDirection : null;
    return (
      <th
        scope="col"
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none cursor-pointer"
        onClick={() => onSort(k)}
      >
        <span className="inline-flex items-center gap-2">
          {label}
          {dir === "asc" && <span>▲</span>}
          {dir === "desc" && <span>▼</span>}
        </span>
      </th>
    );
  };

  return (
    <thead className="bg-[#F0F2F5B8]">
      <tr>
        <Cell label="Id usuario" k="id" />
        <Cell label="Nombre completo" k="name" />
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Correo Electrónico
        </th>
        <Cell label="Teléfono" k="phone" />
        <Cell label="Fecha de registro" k="created" />
        <Cell label="Total" k="total" />
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Acciones
        </th>
      </tr>
    </thead>
  );
}
