"use client";

import PartnerProfile from "./PartnerProfile";
import { BusinessFormData } from "./PartnerProfile";
import { updatePartnerProfile } from "@/src/lib/admin/data/partners/updatePartnerProfile";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditPartnerProfile({
  partnerId,
  partnerData,
}: {
  partnerId: string;
  partnerData: BusinessFormData;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<BusinessFormData>(partnerData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePartnerProfile({
        id: partnerId,
        name: formData.name,
        isPhysical: formData.isPhysical,
        address: formData.address,
        category:
          formData.category === "alcohol"
            ? "alcohol"
            : (formData.category as any),
        phone: formData.phone,
        email: formData.email,
        hours: formData.hours,
        profileState: formData.profileState,
      });
      // Opcional: refrescar la ruta o navegar atrás
      // router.refresh();
    } catch (err) {
      console.error("No se pudo actualizar el aliado", err);
    } finally {
      setIsSubmitting(false);
    }
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
