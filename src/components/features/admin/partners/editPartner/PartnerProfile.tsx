"use client";
import React from "react";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import FooterButtons from "@/src/components/basics/FooterButtons";
import BasicInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import RadioInput from "@/src/components/basics/RadioInput";
import CheckBox from "@/src/components/basics/CheckBox";
import { partnersCategories, valueCategories } from "@/src/lib/type";
import { Hours } from "@/src/lib/type";

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
interface BusinessProfileFormProps {
  formData: BusinessFormData;
  setFormData: React.Dispatch<React.SetStateAction<BusinessFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onGoBack: () => void;
  isSubmitting: boolean;
}

export default function BusinessProfileForm({
  formData,
  setFormData,
  onSubmit,
  onGoBack,
  isSubmitting,
}: BusinessProfileFormProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;

    if (name === "isPhysical") {
      if (value === "yes") {
        setFormData((prev) => ({ ...prev, isPhysical: true }));
        return;
      } else {
        setFormData((prev) => ({ ...prev, isPhysical: false }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHoursChange = (
    day: string,
    field: "active" | "opens" | "closes",
    value: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <form onSubmit={onSubmit}>
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
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md"
                placeholder="Ingresar la información"
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
                    onChange={handleInputChange}
                    label="Sí"
                  />

                  <RadioInput
                    id="noPhysical"
                    name="isPhysical"
                    value="no"
                    checked={formData.isPhysical === false}
                    onChange={handleInputChange}
                    label="No"
                  />
                </div>
              </div>
              <BasicInput
                id="address"
                name="address"
                label="Dirección de facturación"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md"
                placeholder="Ingresar la información"
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
                onChange={handleInputChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <BasicInput
                  autocomplete="on"
                  type="tel"
                  id="phone"
                  name="phone"
                  label="Teléfono"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="Ingresar la información"
                />
                <BasicInput
                  type="email"
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border-gray-300 rounded-md"
                  placeholder="Ingresar la información"
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
                    onChange={(e) =>
                      handleHoursChange(
                        value.toLowerCase(),
                        "active",
                        e.target.checked
                      )
                    }
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
                      onChange={(e) =>
                        handleHoursChange(
                          value.toLowerCase(),
                          "opens",
                          e.target.value
                        )
                      }
                      disabled={!formData.hours[value.toLowerCase()]?.active}
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
                      onChange={(e) =>
                        handleHoursChange(
                          value.toLowerCase(),
                          "closes",
                          e.target.value
                        )
                      }
                      disabled={!formData.hours[value.toLowerCase()]?.active}
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
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profileState: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#525252]"></div>
              </label>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Logo e Imágenes
              </h2>
              <FileUploadZone
                id="logo-upload"
                label="Logo del aliado"
                onFileChange={(file) =>
                  setFormData((prev) => ({ ...prev, logo: file }))
                }
                value={formData.logo}
                acceptedFileTypes="image"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Documentos Legales
              </h2>
              <FileUploadZone
                id="document-upload"
                label="Documentos de verificación de la cuenta bancaria"
                onFileChange={(file) =>
                  setFormData((prev) => ({ ...prev, document: file }))
                }
                acceptedFileTypes="any"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTONES DEL FOOTER --- */}
      <FooterButtons
        onGoBack={onGoBack}
        onPreview={() => console.log("Vista previa:", formData)}
        onSaveAndExit={() => console.log("Guardar y salir:", formData)}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        nextText="Subir cambios"
      />
    </form>
  );
}
