"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { valueCategories } from "@/src/lib/type";
import { Hours } from "@/src/lib/type";
import RegisterFormStep1 from "./RegisterFormStep1";
import RegisterFormStep2 from "./RegisterFormStep2";
import RegisterFormStep3 from "./RegisterFormStep3";
import RegisterFormStep4 from "./RegisterFormStep4";

const actualUrl = "/aliado/registro";

// Define la estructura de los datos del formulario
export interface PartnerRegisterForm {
  session: {
    email: string;
    password: string;
    confirmPassword: string;
    category: valueCategories;
  };
  bussinessData: {
    image: File | null;
    name: string;
    userRnc: string;
    phone: string;
    billingMail: string;
    isPhysical: boolean;
    address: string;
  };
  bankData: {
    holderName: string;
    accountNumber: string;
    accountType: string;
    bankRnc: string;
    document: File | null;
    conditionsAccepted: boolean;
  };
  businessHours: Hours;
}

export default function PartnerRegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = searchParams.get("step") || "1";

  const [formData, setFormData] = useState<PartnerRegisterForm>({
    session: {
      email: "",
      password: "",
      confirmPassword: "",
      category: "market",
    },
    bussinessData: {
      image: null,
      name: "",
      userRnc: "",
      phone: "",
      billingMail: "",
      isPhysical: false,
      address: "",
    },
    bankData: {
      holderName: "",
      accountNumber: "",
      accountType: "",
      bankRnc: "",
      document: null,
      conditionsAccepted: false,
    },
    businessHours: {
      monday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      tuesday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      wednesday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      thursday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      friday: { active: false, opens: "08:00:00", closes: "17:00:00" },
      saturday: { active: false, opens: "08:00:00", closes: "17:00:00" },
    },
  });

  // --- HANDLER PARA EL PASO 1: DATOS DE SESIÓN ---
  const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        [name]: value,
      },
    }));
  };

  // --- HANDLER PARA EL PASO 2: DATOS DEL NEGOCIO ---
  const handleBusinessDataChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "isPhysical") {
      if (value === "yes") {
        setFormData((prev) => ({
          ...prev,
          bussinessData: { ...prev.bussinessData, isPhysical: true },
        }));
        return;
      } else {
        setFormData((prev) => ({
          ...prev,
          bussinessData: { ...prev.bussinessData, isPhysical: false },
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      bussinessData: {
        ...prev.bussinessData,
        [name]: value,
      },
    }));
  };

  // Manejador para el FileUploadButton del paso 2
  const handleFileChange2 = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      bussinessData: {
        ...prev.bussinessData,
        image: file,
      },
    }));
  };

  // Manejador para el FileUploadButton del paso 3
  const handleFileChange3 = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      bankData: {
        ...prev.bankData,
        document: file,
      },
    }));
  };

  // --- HANDLER PARA EL PASO 3: DATOS BANCARIOS ---
  // Este es más flexible para manejar inputs de archivo y checkboxes
  const handleBankDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "conditionsAccepted") {
      if (value === "yes") {
        setFormData((prev) => ({
          ...prev,
          bankData: { ...prev.bankData, conditionsAccepted: true },
        }));
        return;
      } else {
        setFormData((prev) => ({
          ...prev,
          bankData: { ...prev.bankData, conditionsAccepted: false },
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      bankData: {
        ...prev.bankData,
        [name]: value,
      },
    }));
  };

  // --- HANDLER PARA EL PASO 4: HORARIO COMERCIAL ---
  // Este necesita saber el día específico que se está modificando
  const handleBusinessHoursChange = (
    day: keyof PartnerRegisterForm["businessHours"],
    field: keyof PartnerRegisterForm["businessHours"]["monday"], // 'active', 'opens', o 'closes'
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  // Efecto para validar el paso actual y los campos requeridos
  useEffect(() => {
    const validSteps = ["1", "2", "3", "4"];
    const requiredFieldsStep2: (keyof PartnerRegisterForm["bussinessData"])[] =
      ["name", "userRnc", "phone", "billingMail", "address"];

    // Verifica que se esté en un paso válido
    if (!validSteps.includes(currentStep || "")) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
    // No se puede acceder a pasos posteriores sin completar los previos
    if (
      currentStep === "2" &&
      Object.values(formData.session).some((v) => !v)
    ) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
    if (
      currentStep === "3" &&
      requiredFieldsStep2.some(
        (field) =>
          !formData.bussinessData[field as keyof typeof formData.bussinessData]
      )
    ) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
    if (
      currentStep === "4" &&
      Object.values(formData.bankData).some((v) => !v)
    ) {
      router.replace(`${actualUrl}?step=1`);
      return;
    }
  }, [currentStep, router, formData]);

  // Guardias para renderizar el paso correcto o nada
  if (!["1", "2", "3", "4"].includes(currentStep || "")) {
    return null;
  }

  switch (currentStep) {
    case "1":
      return (
        <RegisterFormStep1
          formData={formData}
          onChange={handleSessionChange}
          onGoBack={() => router.push(`/`)}
          onNextStep={() => router.push(`${actualUrl}?step=2`)}
        />
      );
    case "2":
      return (
        <RegisterFormStep2
          formData={formData}
          onChange={handleBusinessDataChange}
          onFileChange={handleFileChange2}
          onGoBack={() => router.push(`${actualUrl}?step=1`)}
          onNextStep={() => router.push(`${actualUrl}?step=3`)}
        />
      );
    case "3":
      return (
        <RegisterFormStep3
          formData={formData}
          onChange={handleBankDataChange}
          onFileChange={handleFileChange3}
          onGoBack={() => router.push(`${actualUrl}?step=2`)}
          onNextStep={() => router.push(`${actualUrl}?step=4`)}
        />
      );
    case "4":
      return (
        <RegisterFormStep4
          formData={formData}
          onChange={handleBusinessHoursChange}
          onGoBack={() => router.push(`${actualUrl}?step=3`)}
          onNextStep={() => {}}
        />
      );
    default:
      return null;
  }
}
