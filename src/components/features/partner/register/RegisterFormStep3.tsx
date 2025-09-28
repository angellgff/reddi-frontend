"use client";

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
        <form onSubmit={onNextStep}>
          <div className="grid grid-cols-2 gap-6">
            <div className="md:col-span-1 col-span-2 space-y-5">
              <BasicInput
                id="holderName"
                name="holderName"
                value={formData.bankData.holderName}
                onChange={onChange}
                label="Titular de la cuenta bancaria"
                placeholder="Ingresa la información"
              />
              <SelectInput
                id="accountType"
                name="accountType"
                value={formData.bankData.accountType}
                options={accountTypeOptions}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                onChange={onChange}
                label="Tipo de cuenta bancaria"
                placeholder="Ingresa la información"
              />
            </div>
            <div className="md:col-span-1 col-span-2 space-y-5">
              <BasicInput
                id="accountNumber"
                name="accountNumber"
                value={formData.bankData.accountNumber}
                onChange={onChange}
                label="Número de cuenta bancaria"
                placeholder="Ingresa la información"
              />
              <BasicInput
                id="bankRnc"
                name="bankRnc"
                value={formData.bankData.bankRnc}
                onChange={onChange}
                label="RNC o boleta registrada en la DGII"
                placeholder="Ingresa la información"
              />
            </div>
            <div className="col-span-2">
              <FileUploadZone
                label="Documentos de verificación de la cuenta bancaria"
                onFileChange={onFileChange}
              />
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
                  onChange={onChange}
                  label="Sí"
                />

                <RadioInput
                  name="conditionsAccepted"
                  id="noConditions"
                  value="no"
                  checked={formData.bankData.conditionsAccepted === false}
                  onChange={onChange}
                  label="No"
                />
              </div>
            </div>
          </div>
        </form>

        <RegisterFooterButtons onGoBack={onGoBack} onSubmit={onNextStep} />
      </div>
    </>
  );
}
