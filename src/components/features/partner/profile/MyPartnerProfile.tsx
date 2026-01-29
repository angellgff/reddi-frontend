"use client";
import React from "react";
import FileUploadZone from "@/src/components/basics/FileUploadZone";
import BasicInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import RadioInput from "@/src/components/basics/RadioInput";
import CheckBox from "@/src/components/basics/CheckBox";
import { partnersCategories, valueCategories } from "@/src/lib/type";
import { Hours } from "@/src/lib/type";
import LocationPickerMap from "@/src/components/features/partner/register/LocationPickerMap";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";

const days = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
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
  lat?: number | null;
  lng?: number | null;
  coverImage?: File | string | null;
  estimated_time?: string | null;
}

// Define las props del componente
interface BusinessProfileFormProps {
  formData: BusinessFormData;
  setFormData: React.Dispatch<React.SetStateAction<BusinessFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onGoBack: () => void;
  isSubmitting: boolean;
}

export default function MyPartnerProfile({
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: BusinessProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/partner/login");
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
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
              {/* Mapa de Ubicación */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-800">
                  Ubicación del negocio
                </label>
                <LocationPickerMap
                  lat={formData.lat || null}
                  lng={formData.lng || null}
                  onLocationSelect={(lat, lng) => {
                    setFormData((prev) => ({ ...prev, lat, lng }));
                  }}
                />
                <p className="text-xs text-gray-500">
                  Haz clic en el mapa para seleccionar la ubicación exacta.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <BasicInput
                    name="lat"
                    value={formData.lat?.toString() || ""}
                    onChange={() => {}}
                    label="Latitud"
                    id="lat"
                    placeholder=""
                    disabled={true}
                  />
                  <BasicInput
                    name="lng"
                    value={formData.lng?.toString() || ""}
                    onChange={() => {}}
                    label="Longitud"
                    id="lng"
                    placeholder=""
                    disabled={true}
                  />
                </div>
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
                disabled={true}
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
              <BasicInput
                id="estimated_time"
                name="estimated_time"
                label="Tiempo estimado de entrega"
                value={formData.estimated_time || ""}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md"
                placeholder="Ej. 30-45 min"
              />
            </div>
          </div>

          {/* Sección Horario de Atención */}
          <div className="bg-white px-6 rounded-xl shadow-sm pb-6">
            <h2 className="text-lg font-semibold text-primary mb-4 ">
              Horario de Atención
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
        <div className="lg:col-span-1 space-y-8 rounded-xl border border-[#D9DCE3] p-5">
          <div className="bg-white rounded-xl shadow-sm space-y-6">
            {/* <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Banner principal
              </h2>
              <FileUploadZone
                id="logo-upload"
                label="Arrastra y suelta tu archivo aquí"
                onFileChange={(file) =>
                  setFormData((prev) => ({ ...prev, logo: file }))
                }
                value={formData.logo}
                acceptedFileTypes="image"
              />
              <p className="text-sm text-gray-500 mt-2">
                Formatos soportados: JPG, PNG,(máx. 10MB)
              </p>
            </div> */}
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">Logo</h2>
              <FileUploadZone
                id="logo-upload-2"
                label="Arrastra y suelta tu archivo aquí"
                onFileChange={(file) =>
                  setFormData((prev) => ({ ...prev, logo: file }))
                }
                value={formData.logo}
                acceptedFileTypes="image"
              />
              <p className="text-sm text-gray-500 mt-2">
                Formatos soportados: JPG, PNG,(máx. 10MB)
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Imagen de portada
              </h2>
              <FileUploadZone
                id="cover-upload"
                label="Arrastra y suelta tu archivo aquí"
                onFileChange={(file) =>
                  setFormData((prev) => ({ ...prev, coverImage: file }))
                }
                value={formData.coverImage}
                acceptedFileTypes="image"
              />
              <p className="text-sm text-gray-500 mt-2">
                Formatos soportados: JPG, PNG,(máx. 10MB)
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Documentos Legales
              </h2>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Documentos de verificación de la cuenta bancaria
              </p>
              <FileUploadZone
                id="document-upload"
                label="Arrastra y suelta tu archivo aquí"
                onFileChange={(file) =>
                  setFormData((prev) => ({ ...prev, document: file }))
                }
                value={formData.document}
                acceptedFileTypes="any"
              />
              <p className="text-sm text-gray-500 mt-2">
                Formatos soportados: PDF, JPG, PNG, DOCX (máx. 10MB)
              </p>
            </div>

            {/* Seguridad de la Cuenta */}
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Seguridad de la Cuenta
              </h2>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cambiar contraseña
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-green-600"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            {/* Notificaciones */}
            <div>
              <h2 className="text-lg font-semibold text-primary mb-4">
                Notificaciones
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Notificaciones por correo
                    </p>
                    <p className="text-sm text-gray-500">
                      Recibir alertas de pedidos y pagos
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Notificaciones push
                    </p>
                    <p className="text-sm text-gray-500">
                      Alertas en tiempo real en la app
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Notificaciones SMS
                    </p>
                    <p className="text-sm text-gray-500">
                      Mensajes de texto importantes
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTONES DEL FOOTER --- */}
      <div className="flex items-center justify-end gap-4 mt-8">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
