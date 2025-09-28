"use client";

import RadioInput from "@/src/components/basics/RadioInput";
import RegisterFooterButtons from "./RegisterFooterButtons";
import BasicInput from "@/src/components/basics/BasicInput";
import { PartnerRegisterForm } from "./PartnerRegisterWizard";
import UploadImageButton from "./UploadImageButton";

import StepperHeader from "./StepperHeader";

interface RegisterFormStep2Props {
  formData: PartnerRegisterForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (file: File | null) => void;
  onGoBack: () => void;
  onNextStep: () => void;
}

export default function RegisterFormStep2({
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
        currentStep={2}
      />
      {/* --- Sección de Título --- */}
      <div className="md:px-8 md:py-6 bg-white rounded-2xl">
        <div className="text-center md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Datos del Local
          </h1>
          <p className="text-gray-500 mt-2 font-roboto">
            La información que nos proporciones será el punto de partida para
            crear tu perfil en nuestro sistema
          </p>
        </div>
        {/* --- Sección del Formulario --- */}
        {/* --- Columna Izquierda --- */}

        {/* Zona de Subir Archivo */}
        <div className="flex flex-col items-center justify-center md:p-6">
          <UploadImageButton
            name="image"
            onFileChange={onFileChange}
            value={formData.bussinessData.image}
          />
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1 space-y-5">
            <BasicInput
              name="name"
              value={formData.bussinessData.name}
              onChange={onChange}
              label="Razón social o nombre"
              id="name"
              placeholder="Ingresa la información"
            />

            <BasicInput
              name="phone"
              value={formData.bussinessData.phone}
              onChange={onChange}
              label="Teléfono del local"
              id="phone"
              placeholder="Ingresar la información"
            />

            <div>
              <p className="block text-sm font-medium text-gray-800 mb-2">
                ¿Es un local físico?
              </p>
              <div className="flex items-center space-x-4">
                <RadioInput
                  id="yesPhysical"
                  name="isPhysical"
                  value="yes"
                  checked={formData.bussinessData.isPhysical === true}
                  onChange={onChange}
                  label="Sí"
                />

                <RadioInput
                  id="noPhysical"
                  name="isPhysical"
                  value="no"
                  checked={formData.bussinessData.isPhysical === false}
                  onChange={onChange}
                  label="No"
                />
              </div>
            </div>
            <BasicInput
              name="address"
              value={formData.bussinessData.address}
              onChange={onChange}
              label="Dirección de facturación"
              id="address"
              placeholder="Ingresar la información"
            />
          </div>
          <div className="grid-cols-1 space-y-5">
            <BasicInput
              name="userRnc"
              value={formData.bussinessData.userRnc}
              onChange={onChange}
              label="RNC o boleta registrada en la DGII"
              id="userRnc"
              type="tel"
              placeholder="Ingresa la información"
            />

            <BasicInput
              name="billingMail"
              value={formData.bussinessData.billingMail}
              onChange={onChange}
              label="Email de facturación"
              id="billingMail"
              placeholder="Ingresar la información"
            />
            <div className="h-48 mx-12 bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
              Componente de Mapa (ej. Google Maps, Mapbox) iría aquí
            </div>
          </div>
        </div>
        <RegisterFooterButtons onGoBack={onGoBack} onSubmit={onNextStep} />
      </div>
    </>
  );
}
