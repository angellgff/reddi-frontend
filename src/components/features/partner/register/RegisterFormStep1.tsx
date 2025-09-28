"use client";

import RegisterFooterButtons from "./RegisterFooterButtons";
import UserIcon from "@/src/components/icons/UserLoginIcon";
import { useState } from "react";
import BasicInput from "@/src/components/basics/BasicInput";
import { PartnerRegisterForm } from "./PartnerRegisterWizard";
import PasswordInputForms from "@/src/components/basics/PasswordInputForms";
import { valueCategories } from "@/src/lib/type";
import Step1Card from "./Step1Card";
import StepperHeader from "./StepperHeader";

const businessTypes: {
  name: string;
  imageUrl: string;
  value: valueCategories;
}[] = [
  {
    name: "Mercado",
    imageUrl: "/Market.svg",
    value: "market",
  },
  {
    name: "Restaurantes",
    imageUrl: "/Burger2.svg",
    value: "restaurant",
  },
  {
    name: "Alcohol",
    imageUrl: "/alcohol.svg",
    value: "alcohol",
  },
  {
    name: "Farmacia",
    imageUrl: "/Pharma.svg",
    value: "pharmacy",
  },
  {
    name: "Tabaco",
    imageUrl: "/Tobacco.svg",
    value: "tobacco",
  },
];

interface RegisterFormStep1Props {
  formData: PartnerRegisterForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGoBack: () => void;
  onNextStep: () => void;
}

export default function RegisterFormStep1({
  formData,
  onChange,
  onGoBack,
  onNextStep,
}: RegisterFormStep1Props) {
  //const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNextStep();
  };

  return (
    <>
      <StepperHeader
        subtitle="Selecciona el tipo de negocio que mejor describe 
                   tu establecimiento para comenzar el registro"
        currentStep={1}
      />
      {/* --- Sección de Título --- */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
          Selecciona un tipo de negocio para continuar
        </h1>
        <p className="text-gray-500 mt-2 font-roboto">
          Selecciona un tipo de negocio para continuar
        </p>
      </div>

      {/* --- Sección de Categorías --- */}
      <section className="mb-12 flex flex-wrap gap-4 justify-center">
        {businessTypes.map((type) => (
          <Step1Card
            name="category"
            value={type.value}
            actualValue={formData.session.category}
            onChange={onChange}
            key={type.value}
            id={`category-${type.value}`}
            label={type.name}
            imageUrl={type.imageUrl}
          />
        ))}
      </section>

      {/* --- Sección del Formulario --- */}
      <form onSubmit={onSubmit} className="pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BasicInput
            name="email"
            value={formData.session.email}
            onChange={onChange}
            label="Correo electrónico"
            id="email"
            type="email"
            placeholder="Ingresa la información"
            icon={<UserIcon />}
          />
          <PasswordInputForms
            id="password"
            name="password"
            value={formData.session.password}
            onChange={onChange}
            displayPassword={setPasswordVisible}
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            isVisible={passwordVisible}
          />
          <PasswordInputForms
            id="confirmPassword"
            name="confirmPassword"
            value={formData.session.confirmPassword}
            onChange={onChange}
            displayPassword={setConfirmPasswordVisible}
            label="Confirmar contraseña"
            placeholder="Confirma tu contraseña"
            isVisible={confirmPasswordVisible}
          />
        </div>
        <RegisterFooterButtons onGoBack={onGoBack} onSubmit={onSubmit} />
      </form>
    </>
  );
}
