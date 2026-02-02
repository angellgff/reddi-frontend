"use client";

import {
  ChevronLeft,
  Bell,
  ShoppingCart,
  Settings,
  Pencil,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateRepartidorProfile } from "@/src/lib/actions/repartidor/updateProfile";
import { toast } from "sonner";

interface SettingsPageClientProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate?: string; // Not in profile table yet, but referenced in UI
  };
}

export default function SettingsPageClient({
  initialData,
}: SettingsPageClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    fullName: `${initialData.firstName} ${initialData.lastName}`.trim(),
    email: initialData.email,
    phone: initialData.phone,
    birthDate: initialData.birthDate || "",
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset data
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        fullName: `${initialData.firstName} ${initialData.lastName}`.trim(),
        email: initialData.email,
        phone: initialData.phone,
        birthDate: initialData.birthDate || "",
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    startTransition(async () => {
      // Split full name into first and last
      const names = formData.fullName.split(" ");
      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";

      const result = await updateRepartidorProfile({
        firstName,
        lastName,
        phone: formData.phone,
        birthDate: formData.birthDate,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Perfil actualizado correctamente");
        setIsEditing(false);
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-white font-openSans overflow-hidden pb-10">
      {/* Curved Header Background */}
      <div
        className="absolute top-[-70px] left-[-20%] w-[140%] h-[190px] bg-[#595959]"
        style={{
          borderRadius: "50%",
          transform: "scaleX(1.1)",
        }}
      />

      {/* Header Content */}
      <div className="relative z-10 px-6 pt-12 pb-4">
        {/* Navbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-white/30 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Page Title & Edit Icon */}
      <div className="relative px-7 mt-8 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-black" />
          <h1 className="text-[20px] font-bold text-black leading-tight">
            Ajustes
          </h1>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEditToggle}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Pencil className="w-5 h-5 text-black" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditToggle}
              className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
              disabled={isPending}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 rounded-full bg-[#595959] text-white hover:bg-black transition-colors"
              disabled={isPending}
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="px-7 space-y-6">
        {/* Nombre Completo */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-black">
            Nombre completo
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full bg-white border border-[#D9DCE3] rounded-lg px-4 py-3 text-[#0D0D0D] font-semibold focus:outline-none focus:ring-2 focus:ring-[#595959]"
            />
          ) : (
            <div className="w-full bg-[#F4F5F7] rounded-lg px-4 py-3 text-[#0D0D0D] font-semibold">
              {formData.fullName || "N/A"}
            </div>
          )}
        </div>

        {/* Correo electrónico */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-black">
            Correo electronico
          </label>
          <div
            className={`w-full rounded-lg px-4 py-3 font-semibold ${
              isEditing
                ? "bg-gray-100 text-gray-400 border border-gray-200"
                : "bg-[#F4F5F7] text-[#767676]"
            }`}
          >
            {formData.email}
          </div>
        </div>

        {/* Número de teléfono */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-black">
            Número de teléfono
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full bg-white border border-[#D9DCE3] rounded-lg px-4 py-3 text-[#0D0D0D] font-semibold focus:outline-none focus:ring-2 focus:ring-[#595959]"
            />
          ) : (
            <div className="w-full bg-[#F4F5F7] rounded-lg px-4 py-3 text-[#767676] font-semibold">
              {formData.phone || "(---) --- ----"}
            </div>
          )}
        </div>

        {/* Fecha de nacimiento */}
        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-black">
            Fecha de nacimiento
          </label>
          {isEditing ? (
            <div className="relative">
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="w-full bg-white border border-[#D9DCE3] rounded-lg px-4 py-3 text-[#0D0D0D] font-semibold focus:outline-none focus:ring-2 focus:ring-[#595959]"
              />
            </div>
          ) : (
            <div className="w-full bg-[#F4F5F7] rounded-lg px-4 py-3 flex items-center justify-between text-[#767676]/50">
              <span className="font-semibold">
                {formData.birthDate || "dd/mm/aaaa"}
              </span>
              <ChevronLeft className="w-5 h-5 -rotate-90 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
