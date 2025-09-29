"use client";

import RadioInput from "@/src/components/basics/RadioInput";
import RegisterFooterButtons from "./RegisterFooterButtons";
import BasicInput from "@/src/components/basics/BasicInput";
import { PartnerRegisterForm } from "./PartnerRegisterWizard";
import UploadImageButton from "./UploadImageButton";
import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [errors, setErrors] = useState<
    Partial<Record<keyof PartnerRegisterForm["bussinessData"], string>>
  >({});

  // Función para verificar errores en los campos del formulario
  const verifyErrors = (
    newErrors: Partial<
      Record<keyof PartnerRegisterForm["bussinessData"], string>
    >
  ) => {
    const requiredFields: (keyof PartnerRegisterForm["bussinessData"])[] = [
      "name",
      "phone",
      "address",
      "userRnc",
      "billingMail",
    ];

    // Verificar campos obligatorios
    requiredFields.forEach((field) => {
      if (!formData.bussinessData[field]?.toString().trim()) {
        newErrors[field] = "Este campo es obligatorio";
      }
    });

    // Verificar imagen
    if (!formData.bussinessData.image) {
      newErrors.image = "La imagen es obligatoria";
    }

    // Verificar formato de correo electrónico
    if (
      formData.bussinessData.billingMail.trim() &&
      !EMAIL_REGEX.test(formData.bussinessData.billingMail.trim())
    ) {
      newErrors.billingMail = "Formato de correo inválido";
    }

    // Si no hay errores, retorna el objeto vacío inicial
    return newErrors;
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpia el error del campo que se está modificando
    if (errors[e.target.name as keyof PartnerRegisterForm["bussinessData"]]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [e.target.name as keyof PartnerRegisterForm["bussinessData"]]:
          undefined,
      }));
    }
    onChange(e);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Partial<
      Record<keyof PartnerRegisterForm["bussinessData"], string>
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
        currentStep={2}
      />
      <div className="md:px-8 md:py-6 bg-white rounded-2xl">
        {/* --- Sección de Título --- */}
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
            error={errors.image}
          />
        </div>

        {/* Formulario */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
          <div className="md:col-span-1 space-y-5">
            <BasicInput
              name="name"
              value={formData.bussinessData.name}
              onChange={onChangeHandler}
              label="Razón social o nombre"
              id="name"
              placeholder="Ingresa la información"
              error={errors.name}
            />

            <BasicInput
              name="phone"
              value={formData.bussinessData.phone}
              onChange={onChangeHandler}
              label="Teléfono del local"
              id="phone"
              placeholder="Ingresar la información"
              error={errors.phone}
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
                  onChange={onChangeHandler}
                  label="Sí"
                />

                <RadioInput
                  id="noPhysical"
                  name="isPhysical"
                  value="no"
                  checked={formData.bussinessData.isPhysical === false}
                  onChange={onChangeHandler}
                  label="No"
                />
              </div>
            </div>
            <BasicInput
              name="address"
              value={formData.bussinessData.address}
              onChange={onChangeHandler}
              label="Dirección de facturación"
              id="address"
              placeholder="Ingresar la información"
              error={errors.address}
            />
          </div>
          <div className="grid-cols-1 space-y-5">
            <BasicInput
              name="userRnc"
              value={formData.bussinessData.userRnc}
              onChange={onChangeHandler}
              label="RNC o boleta registrada en la DGII"
              id="userRnc"
              type="tel"
              placeholder="Ingresa la información"
              error={errors.userRnc}
            />

            <BasicInput
              name="billingMail"
              value={formData.bussinessData.billingMail}
              onChange={onChangeHandler}
              label="Email de facturación"
              id="billingMail"
              placeholder="Ingresar la información"
              error={errors.billingMail}
            />
            <div className="h-48 mx-12 bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
              Componente de Mapa (ej. Google Maps, Mapbox) iría aquí
            </div>
          </div>
        </form>
        <RegisterFooterButtons onGoBack={onGoBack} onSubmit={onSubmit} />
      </div>
    </>
  );
}
