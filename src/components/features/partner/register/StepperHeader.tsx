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
    { number: 2, label: "Información" },
    { number: 3, label: "Productos" },
    { number: 4, label: "Productos" },
  ];

  return (
    <div className="w-full px-2 py-4 text-center text-white md:py-6 font-poppins">
      <h1 className="text-[32px] font-bold leading-10">Únete como Aliado</h1>
      <p className="mx-auto mt-2 max-w-[480px] text-base font-medium leading-[22px] text-white md:text-lg">
        {subtitle}
      </p>

      <div className="mt-10 pb-16 flex flex-wrap items-center justify-center gap-y-3 md:flex-nowrap md:gap-y-0">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          const connectorClasses = "mx-4 hidden h-[2px] w-16 bg-white md:block";

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
