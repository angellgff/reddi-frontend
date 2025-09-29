"use client";

import { useState } from "react";
import InputNotice from "@/src/components/basics/InputNotice";
import RadioInput from "@/src/components/basics/RadioInput";
import RegisterFooterButtons from "./RegisterFooterButtons";
import BasicInput from "@/src/components/basics/BasicInput";
import { PartnerRegisterForm } from "./PartnerRegisterWizard";
import StepperHeader from "./StepperHeader";
import SelectInput from "@/src/components/basics/SelectInput";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import { accountTypeOptions } from "@/src/lib/type";

interface RegisterFormStep2Props {
  formData: PartnerRegisterForm;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onFileChange: (file: File | null) => void;
  onGoBack: () => void;
  onNextStep: () => void;
}

export default function RegisterFormStep3({
  formData,
  onChange,
  onFileChange,
  onGoBack,
  onNextStep,
}: RegisterFormStep2Props) {
  const [errors, setErrors] = useState<
    Partial<Record<keyof PartnerRegisterForm["bankData"], string>>
  >({});

  // Función para verificar errores en los campos del formulario
  const verifyErrors = (
    newErrors: Partial<Record<keyof PartnerRegisterForm["bankData"], string>>
  ) => {
    const requiredFields: (keyof PartnerRegisterForm["bankData"])[] = [
      "holderName",
      "accountType",
      "accountNumber",
      "bankRnc",
    ];

    // Verificar campos obligatorios
    requiredFields.forEach((field) => {
      if (!formData.bankData[field]?.toString().trim()) {
        newErrors[field] = "Este campo es obligatorio";
      }
    });

    // Verificar aceptación de términos
    if (formData.bankData.conditionsAccepted !== true) {
      newErrors.conditionsAccepted =
        "Debe aceptar los términos y condiciones para continuar";
    }

    // Verificar documento
    if (!formData.bankData.document) {
      newErrors.document = "El documento es obligatorio";
    }

    // Si no hay errores, retorna el objeto vacío inicial
    return newErrors;
  };

  const onChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // Limpia el error del campo que se está modificando
    if (errors[e.target.name as keyof PartnerRegisterForm["bankData"]]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [e.target.name as keyof PartnerRegisterForm["bankData"]]: undefined,
      }));
    }
    onChange(e);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Partial<
      Record<keyof PartnerRegisterForm["bankData"], string>
    > = {};
    newErrors = verifyErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onNextStep();
  };

  return (
    <>
      <StepperHeader
        subtitle="Selecciona el tipo de negocio que mejor describe 
tu establecimiento para comenzar el registro"
        currentStep={3}
      />
      {/* --- Sección de Título --- */}
      <div className="md:px-8 md:py-6 bg-white rounded-2xl">
        <div className="text-center md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Datos Bancarios
          </h1>
          <p className="text-gray-500 mt-2 font-roboto">
            La información que nos brindes es crucial para procesar los pagos
            correspondientes a tus liquidaciones
          </p>
        </div>
        {/* --- Sección del Formulario --- */}
        <form noValidate>
          <div className="grid grid-cols-2 gap-6">
            <div className="md:col-span-1 col-span-2 space-y-5">
              <BasicInput
                id="holderName"
                name="holderName"
                value={formData.bankData.holderName}
                onChange={onChangeHandler}
                label="Titular de la cuenta bancaria"
                placeholder="Ingresa la información"
                error={errors.holderName}
              />
              <SelectInput
                id="accountType"
                name="accountType"
                value={formData.bankData.accountType}
                options={accountTypeOptions}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                onChange={onChangeHandler}
                label="Tipo de cuenta bancaria"
                placeholder="Ingresa la información"
                error={errors.accountType}
              />
            </div>
            <div className="md:col-span-1 col-span-2 space-y-5">
              <BasicInput
                id="accountNumber"
                name="accountNumber"
                value={formData.bankData.accountNumber}
                onChange={onChangeHandler}
                label="Número de cuenta bancaria"
                placeholder="Ingresa la información"
                error={errors.accountNumber}
              />
              <BasicInput
                id="bankRnc"
                name="bankRnc"
                value={formData.bankData.bankRnc}
                onChange={onChangeHandler}
                label="RNC o boleta registrada en la DGII"
                placeholder="Ingresa la información"
                error={errors.bankRnc}
              />
            </div>
            <div className="col-span-2">
              <FileUploadZone
                label="Documentos de verificación de la cuenta bancaria"
                onFileChange={onFileChange}
              />
              {errors.document && (
                <InputNotice variant="error" msg={errors.document} />
              )}
            </div>
            <div className="col-span-2">
              {" "}
              <p className="block text-sm font-medium text-gray-800 mb-2">
                Antes de completar el registro, te solicitamos que revises y
                aceptes los términos y condiciones que regirán nuestra
                colaboración.
              </p>
              <div className="flex items-center space-x-4">
                <RadioInput
                  name="conditionsAccepted"
                  id="yesConditions"
                  value="yes"
                  checked={formData.bankData.conditionsAccepted === true}
                  onChange={onChangeHandler}
                  label="Sí"
                />

                <RadioInput
                  name="conditionsAccepted"
                  id="noConditions"
                  value="no"
                  checked={formData.bankData.conditionsAccepted === false}
                  onChange={onChangeHandler}
                  label="No"
                />
              </div>
              {errors.conditionsAccepted && (
                <InputNotice variant="error" msg={errors.conditionsAccepted} />
              )}
            </div>
          </div>
        </form>

        <RegisterFooterButtons onGoBack={onGoBack} onSubmit={onSubmit} />
      </div>
    </>
  );
}
