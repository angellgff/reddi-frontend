"use client";

import { useEffect, useState } from "react";
import InfoPartnerIcon from "@/src/components/icons/InfoPartnerIcon";
import React from "react";
import RegisterFooterButtons from "./RegisterFooterButtons";
import { PartnerRegisterForm } from "./PartnerRegisterWizard";
import StepperHeader from "./StepperHeader";
import SelectInput from "@/src/components/basics/SelectInput";
import CheckBox from "@/src/components/basics/CheckBox";
import Modal from "./Modal";
import InputNotice from "@/src/components/basics/InputNotice";
import Spinner from "@/src/components/basics/Spinner";

const days = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const hoursOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00:00`, label: `${hour}:00` };
});

interface RegisterFormStep4Props {
  formData: PartnerRegisterForm;
  onChange: (
    day: keyof PartnerRegisterForm["businessHours"],
    field: keyof PartnerRegisterForm["businessHours"]["monday"], // 'active', 'opens', o 'closes'
    value: string | boolean
  ) => void;
  onGoBack: () => void;
  onNextStep: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function RegisterFormStep4({
  formData,
  onChange,
  onGoBack,
  onNextStep,
  isSubmitting,
  error,
}: RegisterFormStep4Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnyDayActiveError, setIsAnyDayActiveError] = useState(false);

  const isAnyDayActive = Object.values(formData.businessHours).some(
    (day) => day.active
  );

  const handleValidationAndOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    // Resetea cualquier error previo antes de validar de nuevo
    setIsAnyDayActiveError(false);

    // Se verifica que al menos 1 día esté activo
    if (!isAnyDayActive) {
      setIsAnyDayActiveError(true);
      return;
    }
    // Si todo está bien, se abre el modal de confirmación
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (error) {
      setIsModalOpen(false);
    }
  }, [error]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Se verifica que al menos 1 día esté activo
    if (!isAnyDayActive) {
      setIsAnyDayActiveError(true);
      return;
    }
    setIsAnyDayActiveError(false);
    // Si todo está bien, se abre el modal de confirmación
    setIsModalOpen(true);
  };

  return (
    <>
      <StepperHeader
        subtitle="Selecciona el tipo de negocio que mejor describe 
tu establecimiento para comenzar el registro"
        currentStep={4}
      />
      {/* --- Sección de Título --- */}
      <div className="md:px-8 md:py-6 bg-white rounded-2xl">
        <div className="text-center md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Horarios de Atención
          </h1>
          <p className="text-gray-500 mt-2 font-roboto">
            Configura los días y horarios de operación de tu negocio
          </p>
        </div>
        {/* --- Sección del Formulario --- */}
        <form onSubmit={handleValidationAndOpenModal}>
          <div className="grid grid-cols-3 gap-6">
            {days.map(({ value, label }) => (
              <React.Fragment key={value}>
                <div className="col-span-3 sm:col-span-1 ">
                  <CheckBox
                    id={`${value}-active`}
                    name={`${value}-active`}
                    checked={
                      formData.businessHours[value.toLowerCase()]?.active
                    }
                    onChange={(e) =>
                      onChange(value.toLowerCase(), "active", e.target.checked)
                    }
                    label={label}
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <SelectInput
                    id={`${value}-opens`}
                    name={`${value}-opens`}
                    value={formData.businessHours[value].opens}
                    options={hoursOptions}
                    getOptionValue={(option) => option.value}
                    getOptionLabel={(option) => option.label}
                    placeholder="hh:mm:ss"
                    onChange={(e) => onChange(value, "opens", e.target.value)}
                    disabled={
                      !formData.businessHours[value.toLowerCase()]?.active
                    }
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <SelectInput
                    id={`${value}-closes`}
                    name={`${value}-closes`}
                    value={formData.businessHours[value].closes}
                    options={hoursOptions}
                    getOptionValue={(option) => option.value}
                    getOptionLabel={(option) => option.label}
                    placeholder="hh:mm:ss"
                    onChange={(e) => onChange(value, "closes", e.target.value)}
                    disabled={
                      !formData.businessHours[value.toLowerCase()]?.active
                    }
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
          {isAnyDayActiveError && (
            <InputNotice
              msg="Debe activar al menos un día de la semana"
              variant="error"
            />
          )}

          {error && <InputNotice msg={error} variant="error" />}

          <div className="bg-[#EFF6FF] p-4 flex items-center gap-2 mt-4">
            <span className="bg-[#2563EB] h-5 w-5 rounded-full flex items-center justify-center shrink-0">
              <InfoPartnerIcon fill="white" />
            </span>
            <span className="font-montserrat text-sm text-[#1E40AF]">
              Los horarios se aplicarán automáticamente en la plataforma Reddi
            </span>
          </div>
        </form>

        <RegisterFooterButtons
          onGoBack={onGoBack}
          onSubmit={onNextStep}
          nextText="Finalizar"
        />
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={() => {}}
        />
      </div>

      {isSubmitting && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Registrando tu negocio"
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3">
            <Spinner className="w-10 h-10" />
            <p className="text-sm text-gray-700">Registrando tu negocio...</p>
          </div>
        </div>
      )}
    </>
  );
}
