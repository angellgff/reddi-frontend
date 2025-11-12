type Status = "Pendiente" | "Entregado" | "Cancelado";

export default function StatusChip({ status }: { status: Status }) {
  const map = {
    Pendiente: {
      className: "bg-[#FFF5C5] text-[#E27D00]",
      label: "Pendiente",
    },
    Entregado: {
      className: "bg-[#D7FFD8] text-[#04910C]",
      label: "Entregado",
    },
    Cancelado: {
      className: "bg-[#FFDCDC] text-[#FF0000]",
      label: "Cancelado",
    },
  } as const;

  const style = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-[10px] px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}
