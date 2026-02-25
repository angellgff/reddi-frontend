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
    imageUrl: "/new-market-logo.png",
    value: "market",
  },
  {
    name: "Restaurantes",
    imageUrl: "/restaurant.png",
    value: "restaurant",
  },
  {
    name: "Alcohol",
    imageUrl: "/alcohol.png",
    value: "liquor_store",
  },
  {
    name: "Farmacia",
    imageUrl: "/farmacia.png",
    value: "pharmacy",
  },
  {
    name: "Tabaco",
    imageUrl: "/new-design/nd-tobacco.png",
    value: "tobacco",
  },
];

interface RegisterFormStep1Props {
  formData: PartnerRegisterForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGoBack: () => void;
  onNextStep: () => void;
  errors?: Record<string, string>;
}

export default function RegisterFormStep1({
  formData,
  onChange,
  onGoBack,
  onNextStep,
  errors = {},
}: RegisterFormStep1Props) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNextStep();
  };

  return (
    <div className="flex h-full flex-col text-white">
      <StepperHeader
        subtitle="Selecciona el tipo de negocio que mejor describe 
                   tu establecimiento para comenzar el registro"
        currentStep={1}
      />
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold leading-7 text-white font-poppins">
          Selecciona un tipo de negocio para continuar
        </h2>
        <p className="mt-4 text-base font-normal text-white font-openSans">
          Selecciona un tipo de negocio para continuar
        </p>
      </div>

      <section className="mb-10 flex flex-wrap justify-center gap-[15px]">
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

      <form className="pb-4" noValidate>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-[21px]">
          <BasicInput
            name="email"
            value={formData.session.email}
            onChange={onChange}
            label="Correo electrónico"
            id="email"
            type="email"
            placeholder="Ingresa la información"
            icon={<UserIcon />}
            error={errors.email}
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
            error={errors.password}
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
            error={errors.confirmPassword}
          />
        </div>
        <RegisterFooterButtons onGoBack={onGoBack} onSubmit={onSubmit} />
      </form>
    </div>
  );
}
