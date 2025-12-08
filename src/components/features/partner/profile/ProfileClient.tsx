"use client";

import MyPartnerProfile from "./MyPartnerProfile";
import { BusinessFormData } from "@/src/components/features/admin/partners/editPartner/PartnerProfile";
import { updateMyProfile } from "@/src/lib/actions/partner/updateMyProfile";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import { uploadFile } from "@/src/lib/storage/uploadFile";

export default function ProfileClient({
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
          `logos/${partnerId}`
        );
      } else if (formData.logo === null) {
        logoUrl = null;
      } else if (typeof formData.logo === "string") {
        logoUrl = formData.logo;
      }

      let coverUrl: string | null | undefined = undefined;
      if (formData.coverImage instanceof File) {
        coverUrl = await uploadFile(
          formData.coverImage,
          "business-images",
          `covers/${partnerId}`
        );
      } else if (formData.coverImage === null) {
        coverUrl = null;
      } else if (typeof formData.coverImage === "string") {
        coverUrl = formData.coverImage;
      }

      let documentUrl: string | null | undefined = undefined;
      if (formData.document instanceof File) {
        documentUrl = await uploadFile(
          formData.document,
          "bank-documents",
          `documents/${partnerId}`
        );
      } else if (formData.document === null) {
        documentUrl = null;
      } else if (typeof formData.document === "string") {
        documentUrl = formData.document;
      }

      await updateMyProfile({
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
        lat: formData.lat,
        lng: formData.lng,
        image_url: logoUrl,
        cover_image_url: coverUrl,
        bank_document_url: documentUrl,
      });
      setModalTitle("Cambios guardados");
      setModalDesc("Tu perfil se ha actualizado correctamente.");
      setModalOpen(true);
    } catch (err) {
      console.error("No se pudo actualizar el perfil", err);
      setModalTitle("Error al guardar");
      setModalDesc("No pudimos actualizar tu perfil. Inténtalo nuevamente.");
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-start px-[50px] py-[30px] gap-[29px] w-full min-h-screen bg-[#F0F2F5]">
        {/* Perfil del Aliado */}
        <h1 className="font-poppins font-semibold text-[24px] leading-[28px] text-[#171717]">
          Perfil del Aliado
        </h1>

        {/* Section */}
        <div className="flex flex-col items-start px-[20px] py-[30px] gap-[20px] w-full bg-white rounded-[20px]">
          <MyPartnerProfile
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onGoBack={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title={modalTitle}
        description={modalDesc}
        confirmText="Aceptar"
        cancelText="Cerrar"
        loading={false}
        onConfirm={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
