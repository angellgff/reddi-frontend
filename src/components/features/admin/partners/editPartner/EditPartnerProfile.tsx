"use client";

import PartnerProfile from "./PartnerProfile";
import { BusinessFormData } from "./PartnerProfile";
import { updatePartnerProfile } from "@/src/lib/admin/data/partners/updatePartnerProfile";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import { uploadFile } from "@/src/lib/storage/uploadFile";

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
      let logoUrl: string | null | undefined = undefined;
      if (formData.logo instanceof File) {
        logoUrl = await uploadFile(
          formData.logo,
          "business-images",
          `logos/${partnerId}`,
        );
      } else if (formData.logo === null) {
        logoUrl = null;
      } else if (typeof formData.logo === "string") {
        logoUrl = formData.logo;
      }

      let documentUrl: string | null | undefined = undefined;
      if (formData.document instanceof File) {
        documentUrl = await uploadFile(
          formData.document,
          "bank-documents",
          `documents/${partnerId}`,
        );
      } else if (formData.document === null) {
        documentUrl = null;
      } else if (typeof formData.document === "string") {
        documentUrl = formData.document;
      }

      await updatePartnerProfile({
        id: partnerId,
        name: formData.name,
        isPhysical: formData.isPhysical,
        address: formData.address,
        category:
          formData.category === "alcohol"
            ? "alcohol"
            : (formData.category as "market" | "restaurant" | "alcohol"),
        phone: formData.phone,
        email: formData.email,
        hours: formData.hours,
        profileState: formData.profileState,
        lat: formData.lat,
        lng: formData.lng,
        image_url: logoUrl,
        bank_document_url: documentUrl,
        price_markup_percentage: formData.price_markup_percentage,
        platform_commission_percentage: formData.platform_commission_percentage,
        is_sponsored: formData.is_sponsored,
      });
      setModalTitle("Cambios guardados");
      setModalDesc("El perfil del aliado se actualizó correctamente.");
      setModalOpen(true);
    } catch (err) {
      console.error("No se pudo actualizar el aliado", err);
      setModalTitle("Error al guardar");
      setModalDesc(
        `No pudimos actualizar el perfil del aliado. ${
          err instanceof Error ? err.message : "Error desconocido"
        }`,
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
