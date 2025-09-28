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
  const circleClasses = `
    w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg
    transition-all duration-300 ease-in-out
    ${isActive ? "bg-primary text-white scale-110" : ""}
    ${isCompleted ? "bg-primary text-white" : ""}
    ${!isActive && !isCompleted ? "bg-gray-200 text-gray-500" : ""}
  `;

  const labelClasses = `
    ml-3 text-sm sm:text-base font-medium
    transition-colors duration-300 ease-in-out
    ${isActive ? "text-primary" : "text-gray-500"}
  `;

  return (
    <div className="flex items-center">
      <div className={circleClasses}>
        {isCompleted ? (
          // Muestra un checkmark si el paso está completado
          <CheckBoxIcon className="h-5 w-5" />
        ) : (
          <span className="cursor-default">{number}</span>
        )}
      </div>
      <span className={`${labelClasses} cursor-default`}>{label}</span>
    </div>
  );
}
