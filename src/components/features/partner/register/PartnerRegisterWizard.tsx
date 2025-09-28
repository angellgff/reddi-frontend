"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isSomeFieldsMissing } from "@/src/lib/partner/utils";
import { valueCategories } from "@/src/lib/type";
import { Hours } from "@/src/lib/type";
import RegisterFormStep1 from "./RegisterFormStep1";
import RegisterFormStep2 from "./RegisterFormStep2";

const actualUrl = "/aliado/registro";

const days = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
];

const hoursOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00:00`, label: `${hour}:00` };
});

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
      monday: { active: false, opens: "", closes: "" },
      tuesday: { active: false, opens: "", closes: "" },
      wednesday: { active: false, opens: "", closes: "" },
      thursday: { active: false, opens: "", closes: "" },
      friday: { active: false, opens: "", closes: "" },
      saturday: { active: false, opens: "", closes: "" },
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

  // --- HANDLER PARA EL PASO 3: DATOS BANCARIOS ---
  // Este es más flexible para manejar inputs de archivo y checkboxes
  const handleBankDataChange = (
    fieldName: keyof PartnerRegisterForm["bankData"],
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      bankData: {
        ...prev.bankData,
        [fieldName]: value,
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
          onGoBack={() => router.push(`${actualUrl}?step=1`)}
          onNextStep={() => router.push(`${actualUrl}?step=3`)}
        />
      );
    case "3":
      return;
    case "4":
      return;
    default:
      return null;
  }
}
