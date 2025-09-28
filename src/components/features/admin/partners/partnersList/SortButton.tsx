import SorterIcon from "@/src/components/icons/SorterIcon";

interface SortButtonProps {
  id: string;
  name: string;
  header: string;
  currentSortOrder: "asc" | "desc" | null;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export default function SortButton({
  header,
  onClick,
  className,
  id,
  name,
  currentSortOrder,
}: SortButtonProps) {
  return (
    <button
      className={className}
      type="button"
      id={id}
      name={name}
      onClick={onClick}
    >
      {header}
      {currentSortOrder === "asc" && <span> ▲</span>}
      {currentSortOrder === "desc" && <span> ▼</span>}
      {currentSortOrder === null && <SorterIcon />}
    </button>
  );
}
