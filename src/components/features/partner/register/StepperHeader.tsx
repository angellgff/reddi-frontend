import React from "react";
import Step from "./Step";

interface StepperHeaderProps {
  subtitle: string;
  currentStep: 1 | 2 | 3 | 4;
}

export default function StepperHeader({
  subtitle,
  currentStep,
}: StepperHeaderProps) {
  const steps = [
    { number: 1, label: "Tipo de Negocio" },
    { number: 2, label: "Datos del Local" },
    { number: 3, label: "Datos Bancarios" },
    { number: 4, label: "Horarios" },
  ];

  return (
    <div className="w-full bg-transparent py-8 px-4 text-center">
      {/* Título y Subtítulo */}
      <h1 className="text-3xl sm:text-[32px] font-bold">Únete como Aliado</h1>
      <p className="text-[#6A6C71] mt-2 max-w-lg mx-auto font-medium text-lg">
        {subtitle}
      </p>

      {/* Stepper */}
      <div className="md:mt-8 md:flex md:items-center md:justify-center md:max-w-4xl md:mx-auto">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          // La línea conectora es verde si el paso anterior está completado
          const connectorClasses = `
            flex-grow h-0.5 mx-2
            transition-colors duration-300 ease-in-out
            ${isCompleted ? "bg-primary" : "bg-gray-200"}
          `;

          return (
            <React.Fragment key={step.number}>
              <Step
                number={step.number}
                label={step.label}
                isActive={isActive}
                isCompleted={isCompleted}
              />
              {index < steps.length - 1 && (
                <div className={connectorClasses}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
