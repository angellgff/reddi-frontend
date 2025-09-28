"use client";

import PartnerProfile from "./PartnerProfile";
import { BusinessFormData } from "./PartnerProfile";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditPartnerProfile({
  partnerData,
}: {
  partnerData: BusinessFormData;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<BusinessFormData>(partnerData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Enviando datos a la API:", formData);

    // Simula una llamada a la API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    console.log("Datos enviados con éxito.");
    // Redirigir al siguiente paso
    // router.push('/next-step');
  };

  return (
    <PartnerProfile
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      onGoBack={() => router.back()}
      isSubmitting={isSubmitting}
    />
  );
}
