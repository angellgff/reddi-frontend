"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BasicInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import {
  updateBanner,
} from "@/src/lib/admin/actions/updateBanner";
import { ArrowLeft, Monitor } from "lucide-react";
import { Database } from "@/src/lib/database.types";

type BannerData = Database["public"]["Tables"]["banners"]["Row"];

interface EditBannerFormProps {
  categories: { id: string; name: string }[];
  coupons: { id: string; code: string; title: string }[];
  initialData: BannerData;
  fixedPlacement?: string;
  hidePlacementSelect?: boolean;
  redirectPath?: string;
  enforceGifOnly?: boolean;
  maxFileSizeMb?: number;
}

export default function EditBannerForm({
  categories,
  coupons,
  initialData,
  fixedPlacement,
  hidePlacementSelect = false,
  redirectPath = "/admin/banners",
  enforceGifOnly = false,
  maxFileSizeMb,
}: EditBannerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  console.log("EditBannerForm mounted. Initial Data:", initialData);

  const [title, setTitle] = useState(initialData.title || "");
  const [categoryId, setCategoryId] = useState(initialData.category_id || "");
  const [couponId, setCouponId] = useState(initialData.coupon_id || "");
  const [actionLink, setActionLink] = useState(initialData.action_link || "");
  const [placement, setPlacement] = useState(
    fixedPlacement || initialData.placement || "",
  );
  const [startDate, setStartDate] = useState(initialData.start_date || "");
  const [endDate, setEndDate] = useState(initialData.end_date || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [isActive, setIsActive] = useState(initialData.is_active);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(
    initialData.image_url || "",
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const PLACEMENT_OPTIONS = [
    { id: "home_top", name: "Inicio - Arriba" },
    { id: "search_page", name: "Página de Búsqueda" },
    { id: "test_page", name: "Página de Prueba" },
    { id: "yacht_section", name: "Sección Yate" },
  ];

  const effectivePlacement = fixedPlacement || placement;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = "El título es obligatorio";
    if (!startDate) newErrors.startDate = "La fecha de inicio es obligatoria";
    if (!endDate) newErrors.endDate = "La fecha de fin es obligatoria";
    // For edit, image is required only if no current image exists (which shouldn't happen for valid banners)
    if (!imageFile && !currentImageUrl)
      newErrors.imageFile = "La imagen es obligatoria";

    // Check constraints: End date must be after Start date
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "La fecha de fin debe ser posterior a la de inicio";
    }

    if (imageFile) {
      if (enforceGifOnly && imageFile.type !== "image/gif") {
        newErrors.imageFile = "Solo se permiten archivos GIF.";
      }
      if (maxFileSizeMb && imageFile.size > maxFileSizeMb * 1024 * 1024) {
        newErrors.imageFile = `El archivo no puede superar ${maxFileSizeMb}MB.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setGlobalError(null);
    if (!validateForm()) {
      setGlobalError("Por favor, corrige los errores antes de continuar.");
      return;
    }

    startTransition(async () => {
      try {
        console.log("Submitting update with:", {
          id: initialData.id,
          title,
          categoryId,
          couponId,
          actionLink,
          placement,
          startDate,
          endDate,
          isActive,
        });

        // 1. Update Banner
        const formData = new FormData();
        formData.append("id", initialData.id);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("couponId", couponId);
        formData.append("actionLink", actionLink);
        formData.append("placement", effectivePlacement);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        if (imageFile) {
          formData.append("imageFile", imageFile);
        }
        formData.append("isActive", String(isActive));
        formData.append("enforceGifOnly", String(enforceGifOnly));

        if (maxFileSizeMb) {
          formData.append("maxFileSizeMb", String(maxFileSizeMb));
        }

        const result = await updateBanner({}, formData);

        if (result.success) {
          router.push(redirectPath);
        } else {
          setGlobalError(result.message || "Error al actualizar el banner.");
        }
      } catch (error) {
        console.error("Submission error:", error);
        setGlobalError(
          "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold font-poppins text-[#171717]">
          Editar Banner
        </h1>
        <p className="text-sm font-medium text-[#292929] font-roboto">
          Actualiza la información del banner promocional
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column: Information */}
        <div className="flex-1 bg-white p-5 rounded-[20px] border border-[#D9DCE3]">
          <h2 className="text-xl font-semibold text-[#04BD88] mb-6 font-poppins">
            Información del Banner
          </h2>

          <div className="flex flex-col gap-5">
            <BasicInput
              id="title"
              label="Título del Banner"
              placeholder="Ingresar la información"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              error={errors.title}
            />

            <SelectInput
              id="category"
              label="Categoría"
              options={categories}
              value={categoryId}
              getOptionLabel={(opt) => opt.name}
              getOptionValue={(opt) => opt.id}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Seleccione"
              disabled={isPending}
              error={errors.categoryId}
            />

            {!hidePlacementSelect && (
              <SelectInput
                id="placement"
                label="Ubicación (Placement)"
                options={PLACEMENT_OPTIONS}
                value={effectivePlacement}
                getOptionLabel={(opt) => opt.name}
                getOptionValue={(opt) => opt.id}
                onChange={(e) => setPlacement(e.target.value)}
                placeholder="Seleccione una ubicación"
                disabled={isPending}
                error={errors.placement}
              />
            )}

            <SelectInput
              id="coupon"
              label="Cupón (Opcional)"
              options={coupons}
              value={couponId}
              getOptionLabel={(opt) => `${opt.code} - ${opt.title}`}
              getOptionValue={(opt) => opt.id}
              onChange={(e) => setCouponId(e.target.value)}
              placeholder="Seleccione un cupón"
              disabled={isPending}
            />

            <BasicInput
              id="action-link"
              label="Link de Acción (Opcional)"
              placeholder="https://..."
              value={actionLink}
              onChange={(e) => setActionLink(e.target.value)}
              disabled={isPending}
            />

            <div className="flex gap-4">
              <BasicInput
                id="start-date"
                type="date"
                label="Desde"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isPending}
                className="flex-1"
                placeholder=""
                error={errors.startDate}
              />
              <BasicInput
                id="end-date"
                type="date"
                label="Hasta"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isPending}
                className="flex-1"
                placeholder=""
                error={errors.endDate}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1 font-roboto"
              >
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                placeholder="Ingresa la información"
                className="block w-full rounded-xl border border-[#D9DCE3] p-3 text-sm font-roboto focus:border-primary focus:ring-1 focus:ring-primary h-[120px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Image and Status */}
        <div className="w-full lg:w-[518px] flex flex-col gap-5">
          <div className="bg-white p-5 rounded-[16px] border border-[#D9DCE3]">
            <h2 className="text-xl font-semibold text-[#04BD88] mb-6 font-poppins">
              Imagen del Banner
            </h2>
            <p className="text-sm font-medium text-[#292929] mb-2 font-roboto">
              Logo del logo
            </p>

            {currentImageUrl && !imageFile && (
              <div className="mb-4 relative w-full h-[200px] rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={currentImageUrl}
                  alt="Banner actual"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <FileUploadZone
              onFileChange={(file) => setImageFile(file)}
              acceptedFileTypes="image"
              value={imageFile}
              disabled={isPending}
              label={
                currentImageUrl
                  ? "Seleccionar nueva imagen (reemplazar)"
                  : "Seleccionar imagen"
              }
            />
            {errors.imageFile && (
              <p className="text-sm text-red-500 mt-1">{errors.imageFile}</p>
            )}
            {enforceGifOnly && (
              <p className="text-xs text-[#5D5D5D] mt-2">
                Formato requerido: GIF
                {maxFileSizeMb ? ` (máx. ${maxFileSizeMb}MB)` : ""}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-medium text-[#171717] font-poppins">
                Estado del banner
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isPending}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#525252]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {globalError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {globalError}
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => router.back()}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#292929] hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={isPending}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#04BD88] rounded-xl hover:bg-green-600 opacity-50 cursor-not-allowed"
          >
            Vista previa
          </button>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2.5 text-sm font-medium text-[#202124] bg-white border border-[#202124] rounded-xl hover:bg-gray-50 flex items-center gap-2"
          >
            {isPending ? "Guardando..." : "Guardar y salir"}
          </button>
        </div>
      </div>
    </div>
  );
}
