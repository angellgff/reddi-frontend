"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { valueCategories } from "@/src/lib/type";
import { Hours } from "@/src/lib/type";
import RegisterFormStep1 from "./RegisterFormStep1";
import RegisterFormStep2 from "./RegisterFormStep2";
import RegisterFormStep3 from "./RegisterFormStep3";
import RegisterFormStep4 from "./RegisterFormStep4";
import { registerPartner } from "@/src/lib/actions/partner/register";

const actualUrl = "/partner/registro";

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
    lat: number | null;
    lng: number | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      lat: null,
      lng: null,
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
      sunday: { active: false, opens: "08:00:00", closes: "17:00:00" },
    },
  });

  useEffect(() => {
    console.log(formData);

    return () => {
      console.log("Cleaning up form data log...");
    };
  }, [formData]);

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
  // Handler para la ubicación
  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      bussinessData: {
        ...prev.bussinessData,
        lat,
        lng,
      },
    }));
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      // Session
      formDataToSend.append("email", formData.session.email);
      formDataToSend.append("password", formData.session.password);
      formDataToSend.append("category", formData.session.category);

      // Business
      formDataToSend.append("name", formData.bussinessData.name);
      formDataToSend.append("userRnc", formData.bussinessData.userRnc);
      formDataToSend.append("phone", formData.bussinessData.phone);
      formDataToSend.append("billingMail", formData.bussinessData.billingMail);
      formDataToSend.append(
        "isPhysical",
        String(formData.bussinessData.isPhysical)
      );
      formDataToSend.append("address", formData.bussinessData.address);
      if (formData.bussinessData.lat)
        formDataToSend.append("lat", String(formData.bussinessData.lat));
      if (formData.bussinessData.lng)
        formDataToSend.append("lng", String(formData.bussinessData.lng));
      if (formData.bussinessData.image)
        formDataToSend.append("image", formData.bussinessData.image);

      // Bank
      formDataToSend.append("holderName", formData.bankData.holderName);
      formDataToSend.append("accountNumber", formData.bankData.accountNumber);
      formDataToSend.append("accountType", formData.bankData.accountType);
      formDataToSend.append("bankRnc", formData.bankData.bankRnc);
      formDataToSend.append(
        "conditionsAccepted",
        String(formData.bankData.conditionsAccepted)
      );
      if (formData.bankData.document)
        formDataToSend.append("document", formData.bankData.document);

      // Hours
      formDataToSend.append(
        "businessHours",
        JSON.stringify(formData.businessHours)
      );

      const result = await registerPartner(null, formDataToSend);

      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onLocationChange={handleLocationChange}
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
          onNextStep={handleSubmit} // ¡Aquí conectamos la función de envío!
          isSubmitting={isSubmitting} // Pasamos el estado de carga
          error={error} // Pasamos el mensaje de error para mostrarlo en la UI
        />
      );
    default:
      return null;
  }
}
