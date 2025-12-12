"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import BasicInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import { createBanner, CreateBannerState } from "@/src/lib/admin/actions/createBanner";
import { uploadFile } from "@/src/lib/storage/uploadFile";
import { ArrowLeft, Monitor } from "lucide-react";

interface CreateBannerFormProps {
  categories: { id: string; name: string }[];
  coupons: { id: string; code: string; title: string }[];
}

export default function CreateBannerForm({ categories, coupons }: CreateBannerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  console.log("CreateBannerForm mounted. Categories:", categories);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [couponId, setCouponId] = useState(""); // New
  const [actionLink, setActionLink] = useState(""); // New
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate || !description || !imageFile) {
      setErrorMsg("Por favor, completa todos los campos.");
      return;
    }

    startTransition(async () => {
      try {
        console.log("Submitting with:", { title, categoryId, couponId, actionLink, startDate, endDate, isActive });
        
        // 1. Upload Image
        const imageUrl = await uploadFile(imageFile, "banners", "images");
        
        if (!imageUrl) {
          setErrorMsg("Error al subir la imagen. Inténtalo de nuevo.");
          return;
        }

        // 2. Create Banner
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("categoryId", categoryId);
        formData.append("couponId", couponId); // New
        formData.append("actionLink", actionLink); // New
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        formData.append("imageUrl", imageUrl);
        formData.append("isActive", String(isActive));

        const result = await createBanner({}, formData);

        if (result.success) {
          router.push("/admin/banners");
        } else {
          setErrorMsg(result.message || "Error al crear el banner.");
        }
      } catch (error) {
        console.error("Submission error:", error);
        setErrorMsg("Ocurrió un error inesperado.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
         <h1 className="text-2xl font-semibold font-poppins text-[#171717]">Crear Banner</h1>
         <p className="text-sm font-medium text-[#292929] font-roboto">Crea un nuevo banner promocional para la aplicación</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Column: Information */}
        <div className="flex-1 bg-white p-5 rounded-[20px] border border-[#D9DCE3]">
          <h2 className="text-xl font-semibold text-[#04BD88] mb-6 font-poppins">Información del Banner</h2>
          
          <div className="flex flex-col gap-5">
            <BasicInput
              id="title"
              label="Título del Banner"
              placeholder="Ingresar la información"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
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
            />

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
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 font-roboto">
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
                 <h2 className="text-xl font-semibold text-[#04BD88] mb-6 font-poppins">Imagen del Banner</h2>
                 <p className="text-sm font-medium text-[#292929] mb-2 font-roboto">Logo del logo</p>
                 
                 <FileUploadZone
                    onFileChange={(file) => setImageFile(file)}
                    acceptedFileTypes="image"
                    value={imageFile}
                    disabled={isPending}
                    label=""
                 />
                 
                 <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#171717] font-poppins">Estado del banner</span>
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

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {errorMsg}
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
             className="px-5 py-2.5 text-sm font-medium text-white bg-[#04BD88] rounded-xl hover:bg-green-600"
           >
             Vista previa
           </button>
           <button
             type="button"
              disabled={isPending}
             className="px-5 py-2.5 text-sm font-medium text-[#202124] bg-white border border-[#202124] rounded-xl hover:bg-gray-50"
           >
             Guardar y salir
           </button>
            <button
             onClick={handleSubmit}
             disabled={isPending}
             className="px-5 py-2.5 text-sm font-medium text-white bg-[#04BD88] rounded-xl hover:bg-green-600 flex items-center gap-2"
           >
             {isPending ? "Guardando..." : "Siguiente"} 
             {/* Arrow right icon if needed */}
           </button>
        </div>
      </div>
    </div>
  );
}
