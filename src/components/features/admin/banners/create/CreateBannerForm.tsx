"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { toast } from "sonner";
import BasicInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import {
  createBanner,
  //  CreateBannerState,
} from "@/src/lib/admin/actions/createBanner";
import { uploadFile } from "@/src/lib/storage/uploadFile";
import {
  ArrowLeft,
  Monitor,
  CalendarIcon,
  ImageIcon,
  LinkIcon,
  TagIcon,
} from "lucide-react";

interface CreateBannerFormProps {
  categories: { id: string; name: string }[];
  coupons: { id: string; code: string; title: string }[];
  fixedPlacement?: string;
  hidePlacementSelect?: boolean;
  redirectPath?: string;
  enforceGifOnly?: boolean;
  maxFileSizeMb?: number;
}

const bannerSchema = z
  .object({
    title: z
      .string()
      .min(3, "El título debe tener al menos 3 caracteres")
      .max(100, "El título no puede exceder los 100 caracteres"),
    categoryId: z.string().optional(),
    couponId: z.string().optional(),
    actionLink: z
      .string()
      .optional()
      .refine((val) => !val || val.startsWith("http") || val.startsWith("/"), {
        message:
          "El link debe ser una URL válida (http/https) o una ruta relativa (/)",
      }),
    placement: z.string().min(1, "Debes seleccionar una ubicación"),
    startDate: z.string().min(1, "La fecha de inicio es requerida"),
    endDate: z.string().min(1, "La fecha de fin es requerida"),
    description: z.string().max(500, "La descripción es muy larga").optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior a la de inicio",
      path: ["endDate"],
    },
  );

export default function CreateBannerForm({
  categories,
  coupons,
  fixedPlacement,
  hidePlacementSelect = false,
  redirectPath = "/admin/banners",
  enforceGifOnly = false,
  maxFileSizeMb,
}: CreateBannerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [couponId, setCouponId] = useState("");
  const [actionLink, setActionLink] = useState("");
  const [placement, setPlacement] = useState(fixedPlacement || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    try {
      bannerSchema.parse({
        title,
        categoryId,
        couponId,
        actionLink,
        placement: effectivePlacement,
        startDate,
        endDate,
        description,
      });

      const newErrors: { [key: string]: string } = {};
      if (!imageFile) {
        newErrors.imageFile = "La imagen es obligatoria";
      } else {
        if (enforceGifOnly && imageFile.type !== "image/gif") {
          newErrors.imageFile = "Solo se permiten archivos GIF.";
        }
        if (maxFileSizeMb && imageFile.size > maxFileSizeMb * 1024 * 1024) {
          newErrors.imageFile = `El archivo no puede superar ${maxFileSizeMb}MB.`;
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};

        // Defensive check for errors property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const issues = error.issues || (error as any).errors || [];

        if (Array.isArray(issues)) {
          issues.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
        }

        if (!imageFile) {
          fieldErrors.imageFile = "La imagen es obligatoria";
        } else {
          if (enforceGifOnly && imageFile.type !== "image/gif") {
            fieldErrors.imageFile = "Solo se permiten archivos GIF.";
          }
          if (maxFileSizeMb && imageFile.size > maxFileSizeMb * 1024 * 1024) {
            fieldErrors.imageFile = `El archivo no puede superar ${maxFileSizeMb}MB.`;
          }
        }

        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    setGlobalError(null);
    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    startTransition(async () => {
      try {
        console.log("Iniciando proceso de creación de banner...");

        // 2. Create Banner (Upload handled in Server Action)
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("couponId", couponId);
        formData.append("actionLink", actionLink);
        formData.append("placement", effectivePlacement);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        formData.append("isActive", String(isActive));
        formData.append("enforceGifOnly", String(enforceGifOnly));

        if (maxFileSizeMb) {
          formData.append("maxFileSizeMb", String(maxFileSizeMb));
        }

        if (imageFile) {
          console.log("Adjuntando archivo de imagen:", imageFile.name);
          formData.append("imageFile", imageFile);
        } else {
          // Should be caught by validateForm, but safety check
          setErrors((prev) => ({
            ...prev,
            imageFile: "La imagen es obligatoria",
          }));
          return;
        }

        console.log("Enviando datos al servidor...");
        // Call the server action directly
        const result = await createBanner({}, formData);
        console.log("Respuesta del servidor:", result);

        if (result.success) {
          toast.success("Banner creado exitosamente");
          // Add a small delay/check before pushing to ensure user sees success
          router.push(redirectPath);
        } else {
          console.error("Error en server action:", result.message);
          toast.error(result.message || "Error al crear el banner.");
          setGlobalError(result.message || "Error al crear el banner.");
        }
      } catch (error) {
        console.error("Submission error catch:", error);
        toast.error("Ocurrió un error inesperado.");
        setGlobalError("Ocurrió un error inesperado al procesar la solicitud.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold font-poppins text-[#171717]">
          Crear Banner
        </h1>
        <p className="text-sm font-medium text-[#292929] font-roboto">
          Crea un nuevo banner promocional para la aplicación
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
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
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
              Imagen promocional
            </p>

            <FileUploadZone
              onFileChange={(file) => setImageFile(file)}
              acceptedFileTypes="image"
              value={imageFile}
              disabled={isPending}
              label=""
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
          {/* Vista previa might be non-functional, keeping it as UI element */}
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
