import CheckBoxIcon from "@/src/components/icons/CheckBoxIcon";

interface StepProps {
  number: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

export default function StepperHeader({
  number,
  label,
  isActive,
  isCompleted,
}: StepProps) {
  const circleClasses =
    "h-8 w-8 rounded-full bg-white text-black flex items-center justify-center text-base font-medium";

  const labelClasses =
    "text-sm font-medium leading-5 text-white transition-opacity duration-200";

  return (
    <div className="flex items-center gap-2">
      <div className={circleClasses}>
        {isCompleted ? (
          <CheckBoxIcon className="h-4 w-4" />
        ) : (
          <span className="cursor-default">{number}</span>
        )}
      </div>
      <span
        className={`${labelClasses} cursor-default ${isActive ? "opacity-100" : "opacity-90"}`}
      >
        {label}
      </span>
    </div>
  );
}
