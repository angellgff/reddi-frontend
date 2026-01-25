"use client";

import { useState, useTransition } from "react";
import { Settings, Pencil, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUserProfile } from "@/src/lib/finalUser/profile/actions";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  initialValues: {
    fullName: string;
    email: string;
    phone: string;
    birthDate?: string;
  };
}

export default function SettingsForm({ initialValues }: SettingsFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formValues, setFormValues] = useState(initialValues);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Reset values if cancelling? optional.
    if (isEditing) {
      setFormValues(initialValues);
    }
  };

  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();

      // Split Name
      const parts = formValues.fullName.trim().split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", formValues.email);
      formData.append("phone_number", formValues.phone);
      // birthdate handling if needed by backend, currently actions doesn't seem to have it?
      // checking actions.ts... it allows first_name, last_name, phone_number, email.
      // I don't see birthdate in the update payload in actions.ts. user didn't ask to add it to backend so I'll skip sending it if not supported.

      const result = await updateUserProfile(formData);
      if (result.success) {
        toast.success("Perfil actualizado");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error("Error al actualizar");
      }
    });
  };

  return (
    <div className="md:hidden min-h-screen bg-transparent pt-[165px] px-6 pb-20 font-sans">
      {/* Title */}
      <div className="flex items-center justify-between mb-8 relative z-10 text-black">
        <div className="flex items-center gap-3">
          <Settings className="w-7 h-7 stroke-[2.5]" />
          <h1 className="text-[20px] font-bold font-open-sans leading-tight">
            Ajustes
          </h1>
        </div>
        <button
          onClick={toggleEdit}
          className={`p-2 rounded-full transition-colors ${isEditing ? "bg-gray-100" : ""}`}
          aria-label="Editar"
        >
          <Pencil
            className={`w-5 h-5 ${isEditing ? "text-primary" : "text-black"}`}
          />
        </button>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-6 relative z-10 font-open-sans">
        {/* Name */}
        <div>
          <label className="block text-[13px] font-bold text-black mb-2">
            Nombre completo
          </label>
          <div
            className={`w-full h-[40px] rounded-lg px-4 flex items-center transition-colors ${isEditing ? "bg-white border border-gray-200" : "bg-[#F4F5F7]"}`}
          >
            <input
              type="text"
              value={formValues.fullName}
              disabled={!isEditing}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full h-full bg-transparent text-[13px] font-semibold text-black placeholder:text-black/40 focus:outline-none disabled:text-black/40"
              placeholder="Sin nombre"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[13px] font-bold text-black mb-2">
            Correo electronico
          </label>
          <div
            className={`w-full h-[40px] rounded-lg px-4 flex items-center transition-colors ${isEditing ? "bg-white border border-gray-200" : "bg-[#F4F5F7]"}`}
          >
            <input
              type="email"
              value={formValues.email}
              disabled={!isEditing}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full h-full bg-transparent text-[13px] font-semibold text-black placeholder:text-black/40 focus:outline-none disabled:text-black/40"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[13px] font-bold text-black mb-2">
            Número de teléfono
          </label>
          <div
            className={`w-full h-[40px] rounded-lg px-4 flex items-center transition-colors ${isEditing ? "bg-white border border-gray-200" : "bg-[#F4F5F7]"}`}
          >
            <input
              type="tel"
              value={formValues.phone}
              disabled={!isEditing}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full h-full bg-transparent text-[13px] font-semibold text-black placeholder:text-black/40 focus:outline-none disabled:text-black/40"
              placeholder="123 456 7890"
            />
          </div>
        </div>

        {/* Birth Date (Read only / visual only as per backend limitation mostly?) */}
        <div>
          <label className="block text-[13px] font-bold text-black mb-2">
            Fecha de nacimiento
          </label>
          <div
            className={`w-full h-[40px] bg-[#F4F5F7] rounded-lg px-4 flex items-center justify-between`}
          >
            <input
              type="text" // use date picker if needed but backend support is questionable right now
              value={formValues.birthDate}
              disabled={true} // Keep disabled for now based on request focusing on fields that existed
              className="w-full h-full bg-transparent text-[13px] font-semibold text-black/40 focus:outline-none"
              placeholder="dd/mm/aaaa"
            />
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed bottom-8 left-0 w-full px-6 z-20 md:absolute md:bottom-auto md:mt-8">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full h-[50px] bg-[#E8C500] rounded-[18px] text-white text-[20px] font-bold flex items-center justify-center disabled:opacity-70 shadow-md transition-all active:scale-[0.98]"
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
}
