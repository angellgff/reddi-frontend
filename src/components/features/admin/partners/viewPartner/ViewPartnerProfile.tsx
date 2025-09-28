"use client";
import React from "react";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import BasicInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import RadioInput from "@/src/components/basics/RadioInput";
import CheckBox from "@/src/components/basics/CheckBox";
import { partnersCategories, valueCategories } from "@/src/lib/type";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import { useRouter } from "next/navigation";

const days = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
];

const hoursOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return { value: `${hour}:00:00`, label: `${hour}:00` };
});

type Hours = Record<string, { active: boolean; opens: string; closes: string }>;

// Define la estructura de los datos del formulario
export interface BusinessFormData {
  name: string;
  isPhysical: boolean;
  address: string;
  category: valueCategories;
  phone: string;
  email: string;
  hours: Hours;
  profileState: boolean;
  logo?: File | string | null;
  document?: File | string | null;
}

// Define las props del componente
interface ViewPartnerProfileProps {
  formData: BusinessFormData;
}

export default function ViewPartnerProfile({
  formData,
}: ViewPartnerProfileProps) {
  const router = useRouter();
  return (
    <form>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="lg:col-span-1 border border-[#D9DCE3] rounded-xl">
          {/* Sección Datos del Negocio */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Datos del Negocio
            </h2>
            <div className="space-y-4">
              <BasicInput
                id="name"
                name="name"
                label="Nombre del negocio"
                value={formData.name}
                className="w-full border-gray-300 rounded-md"
                placeholder="Ingresar la información"
                disabled
                readOnly
              />
              <div>
                <label
                  htmlFor="yesPhysical"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  ¿Es un local físico?
                </label>
                <div className="flex items-center gap-4">
                  <RadioInput
                    id="yesPhysical"
                    name="isPhysical"
                    value="yes"
                    checked={formData.isPhysical === true}
                    label="Sí"
                    disabled
                    readOnly
                  />

                  <RadioInput
                    id="noPhysical"
                    name="isPhysical"
                    value="no"
                    checked={formData.isPhysical === false}
                    label="No"
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <BasicInput
                id="address"
                name="address"
                label="Dirección de facturación"
                value={formData.address}
                className="w-full border-gray-300 rounded-md"
                placeholder="Ingresar la información"
                disabled
                readOnly
              />
              {/* Placeholder para el mapa */}
              <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
                Componente de Mapa (ej. Google Maps, Mapbox) iría aquí
              </div>
              <SelectInput
                id="category"
                name="category"
                options={partnersCategories}
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                label="Categorías"
                placeholder="Seleccione una categoría"
                value={formData.category}
                disabled
              />
              <div className="grid grid-cols-2 gap-4">
                <BasicInput
                  autocomplete="on"
                  type="tel"
                  id="phone"
                  name="phone"
                  label="Teléfono"
                  value={formData.phone}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="Ingresar la información"
                  disabled
                  readOnly
                />
                <BasicInput
                  type="email"
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  value={formData.email}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="Ingresar la información"
                  disabled
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Sección Horario de Atención */}
          <div className="bg-white px-6 rounded-xl shadow-sm pb-6">
            <h2 className="text-lg font-semibold text-primary mb-4 ">
              Datos del Negocio
            </h2>
            <div className="space-y-3">
              {days.map(({ value, label }) => (
                <div key={value} className="flex items-center justify-between">
                  <CheckBox
                    id={value}
                    label={label}
                    checked={formData.hours[value.toLowerCase()]?.active}
                    disabled
                    readOnly
                  />
                  <div className="flex items-center justify-evenly grow px-6 gap-4">
                    <SelectInput
                      className="grow"
                      id={`${value}-opens`}
                      name={`${value}-opens`}
                      options={hoursOptions}
                      getOptionValue={(option) => option.value}
                      getOptionLabel={(option) => option.label}
                      placeholder="hh:mm:ss"
                      value={formData.hours[value.toLowerCase()]?.opens}
                      disabled
                    />

                    <SelectInput
                      className="grow"
                      id={`${value}-closes`}
                      name={`${value}-closes`}
                      options={hoursOptions}
                      getOptionValue={(option) => option.value}
                      getOptionLabel={(option) => option.label}
                      placeholder="hh:mm:ss"
                      value={formData.hours[value.toLowerCase()]?.closes}
                      disabled
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className="lg:col-span-1 space-y-8 rounded-xl border border-[#D9DCE3] ">
          <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Estado del perfil</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="profileState"
                  type="checkbox"
                  checked={formData.profileState}
                  className="sr-only peer"
                  readOnly
                  disabled
                />
                <div
                  className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#525252]
                peer-disabled:cursor-not-allowed"
                ></div>
              </label>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Logo e Imágenes
              </h2>
              <FileUploadZone
                label="Logo del aliado"
                value={formData.logo}
                disabled
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Documentos Legales
              </h2>
              <FileUploadZone label="Documentos de verificación de la cuenta bancaria" />
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTONES DEL FOOTER --- */}
      <div className="flex items-center justify-between mt-12 border-t pt-6">
        {/* Botón de Volver */}
        <button
          type="button"
          className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => router.push("/admin/aliados")}
        >
          <ArrowLeftIcon />
        </button>
      </div>
    </form>
  );
}
