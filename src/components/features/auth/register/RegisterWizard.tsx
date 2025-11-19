"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Step1 from "./Step1";
import Step2 from "./Step2";

export default function RegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const currentStep = searchParams.get("step");

  useEffect(() => {
    const validSteps = ["1", "2", "3"];
    // Verifica que se esté en un paso válido
    if (!validSteps.includes(currentStep || "")) {
      router.replace("/registro/celular?step=1");
      return;
    }
    // Si se intenta acceder al paso 2 sin haber completado el paso 1 redirige al paso 1
    if (currentStep === "2" && phone === "") {
      router.replace("/registro/celular?step=1");
      return;
    }
    // Si se intenta acceder al paso 3 sin haber verificado el teléfono redirige al paso 1
    if (currentStep === "3" && !isPhoneVerified) {
      router.replace("/registro/celular?step=1");
      return;
    }
  }, [currentStep, router, phone, isPhoneVerified]);

  const step1Handler = (phoneValue: string) => {
    setPhone(phoneValue);
    console.log("El número es", phoneValue);
    // Llamada a la API
    router.push("/registro/celular?step=2");
  };

  const step2Handler = (codeValue: string) => {
    console.log("Se está enviando el código", codeValue);
    // Llamada a la API
    setIsPhoneVerified(true);
  };

  if (!["1", "2", "3"].includes(currentStep || "")) {
    return null;
  }

  if (currentStep === "2" && phone === "") {
    return null;
  }

  if (currentStep === "3" && !isPhoneVerified) {
    return null;
  }

  switch (currentStep) {
    case "1":
      return <Step1 onSubmit={step1Handler} />;
    case "2":
      return <Step2 onSubmit={step2Handler} />;
    case "3":
      return <h1>Paso3</h1>;
    default:
      return null;
  }
}
