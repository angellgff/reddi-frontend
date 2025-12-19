"use client";

import Link from "next/link";
import { useState } from "react";
import { DriverProfileRow } from "@/src/lib/admin/data/drivers/getDriverProfile";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/src/lib/storage/uploadFile";
import { updateDriverProfile } from "@/src/lib/admin/data/drivers/updateDriverProfile";

interface DriverProfileFormProps {
  driver: DriverProfileRow;
}

export default function DriverProfileForm({ driver }: DriverProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: driver.first_name || "",
    lastName: driver.last_name || "",
    email: driver.email || "",
    phone: driver.phone_number || "",
    vehicleType: driver.vehicle_type || "",
    vehicleDetails: JSON.stringify(driver.vehicle_details, null, 2) || "",
    identity_card_url: driver.identity_card_url || "",
    driver_license_url: driver.driver_license_url || "",
    background_check_url: driver.background_check_url || "",
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleFileUpload = async (key: string, file: File) => {
    try {
      setUploading((prev) => ({ ...prev, [key]: true }));
      // Use a consistent bucket for driver docs
      const bucket = "driver-documents"; 
      // We categorize by user id to keep it organized
      const path = `${driver.id}`; 
      
      const publicUrl = await uploadFile(file, bucket, path);
      
      if (publicUrl) {
        setFormData((prev) => ({ ...prev, [key]: publicUrl }));
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Error al subir archivo. Asegúrate de que el bucket 'driver-documents' exista.");
    } finally {
      setUploading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const result = await updateDriverProfile(driver.id, {
        phone_number: formData.phone,
        identity_card_url: formData.identity_card_url,
        driver_license_url: formData.driver_license_url,
        background_check_url: formData.background_check_url,
    });

    setSaving(false);
    
    if (result.success) {
        alert("Perfil actualizado correctamente");
        router.refresh();
    } else {
        alert("Error al actualizar perfil: " + result.error);
    }
  };

  const fullName = [driver.first_name, driver.last_name].filter(Boolean).join(" ");

  const documents = [
    { label: "Documento de identidad", key: "identity_card_url" },
    { label: "Licencia de conducción", key: "driver_license_url" },
    { label: "Antecedentes", key: "background_check_url" },
  ];

  return (
    <form onSubmit={handleSubmit} className="px-12 py-8">
      <h1 className="text-2xl font-semibold text-[#171717] mb-6">
        Perfil de {fullName || "Repartidor"}
      </h1>

      <section className="bg-white rounded-2xl p-6 space-y-5 border border-[#D9DCE3]">
        <h2 className="text-[#04BD88] text-xl font-semibold">
          Datos personales
        </h2>
        {/* ... (Photo upload can be implemented similarly later) ... */}
        <div className="flex items-start gap-6">
          <div className="w-[108px] h-[108px] rounded-full bg-gray-200" />
          <div className="flex flex-col gap-3">
             {/* Stub for profile photo */}
             <div className="text-sm text-gray-500">Foto de perfil (próximamente)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm text-[#292929] font-medium mb-2">
              Nombre completo
            </label>
            <input
              className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-sm bg-gray-50"
              value={`${formData.firstName} ${formData.lastName}`}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm text-[#292929] font-medium mb-2">
              Correo electrónico
            </label>
            <input
              className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-sm bg-gray-50"
              value={formData.email}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm text-[#292929] font-medium mb-2">
              Teléfono
            </label>
            <input
              className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-sm"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
        </div>

        {/* Vehicle Info Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
             <h3 className="text-lg font-medium text-gray-800 mb-4">Información del Vehículo</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm text-[#292929] font-medium mb-2">Tipo de Vehículo</label>
                    <input 
                        className="w-full h-10 rounded-xl border border-[#D9DCE3] px-4 text-sm bg-gray-50 capitalize"
                        value={formData.vehicleType || "No asignado"}
                        readOnly
                    />
                </div>
                <div>
                     <label className="block text-sm text-[#292929] font-medium mb-2">Detalles (JSON)</label>
                     <textarea 
                        className="w-full p-2 rounded-xl border border-[#D9DCE3] text-sm bg-gray-50 font-mono h-[80px]"
                        value={formData.vehicleDetails}
                        readOnly
                     />
                </div>
             </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-[#171717]">Estado del perfil: <span className="font-bold">{driver.status || "Desconocido"}</span></p>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6 mt-6 space-y-5 border border-[#D9DCE3]">
        <h2 className="text-[#04BD88] text-xl font-semibold">Documentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map((d) => (
            <div key={d.key} className="space-y-2">
              <label className="block text-sm text-[#292929] font-medium">
                {d.label}
              </label>
              <div className="border border-dashed border-[#D0D5DD] rounded-lg p-6 text-center relative">
                {/* @ts-ignore */}
                {formData[d.key] ? (
                    <div className="flex flex-col items-center gap-2">
                        <Link 
                            // @ts-ignore
                            href={formData[d.key]} 
                            target="_blank" 
                            className="text-[#04BD88] text-sm font-medium hover:underline break-words max-w-full"
                        >
                            Ver Archivo Cargado
                        </Link>
                        <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({...prev, [d.key]: ""}))}
                            className="text-red-500 text-xs hover:underline"
                        >
                            Quitar
                        </button>
                    </div>
                ) : (
                    <>
                        {uploading[d.key] ? (
                            <div className="text-[#04BD88] text-sm">Subiendo...</div>
                        ) : (
                            <>
                                <div className="text-[#04BD88] font-bold text-sm">
                                    Haz clic para subir
                                </div>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleFileUpload(d.key, e.target.files[0]);
                                        }
                                    }}
                                />
                            </>
                        )}
                        <div className="mt-2 text-[#5D5D5D] text-sm">
                        PDF, JPG, PNG
                        </div>
                    </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between mt-6">
        <Link
          href="/admin/drivers"
          className="flex items-center gap-2 px-5 py-2 rounded-xl border border-[#101828] text-[#202124]"
        >
          Volver
        </Link>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="px-5 py-2 rounded-xl border border-[#202124] bg-white text-[#202124]">
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className={`px-5 py-2 rounded-xl bg-[#04BD88] text-white ${saving ? "opacity-50" : ""}`}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </form>
  );
}
