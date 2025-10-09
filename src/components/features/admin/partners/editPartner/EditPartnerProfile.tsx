"use client";

import PartnerProfile from "./PartnerProfile";
import { BusinessFormData } from "./PartnerProfile";
import { updatePartnerProfile } from "@/src/lib/admin/data/partners/updatePartnerProfile";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/src/components/basics/ConfirmModal";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalDesc, setModalDesc] = useState<string>("");

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
      setModalTitle("Cambios guardados");
      setModalDesc("El perfil del aliado se actualizó correctamente.");
      setModalOpen(true);
    } catch (err) {
      console.error("No se pudo actualizar el aliado", err);
      setModalTitle("Error al guardar");
      setModalDesc(
        "No pudimos actualizar el perfil del aliado. Inténtalo nuevamente."
      );
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PartnerProfile
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onGoBack={() => router.back()}
        isSubmitting={isSubmitting}
      />

      <ConfirmModal
        open={modalOpen}
        title={modalTitle}
        description={modalDesc}
        confirmText="Aceptar"
        cancelText="Volver"
        loading={false}
        onConfirm={() => router.push("/admin/aliados")}
        onCancel={() => router.push("/admin/aliados")}
      />
    </>
  );
}
