// components/AddressEditForm.tsx
"use client";

// importar useTransition si decido usarlo
import { useState, useTransition } from "react";
import ArrowIcon from "@/src/components/icons/ArrowIcon";
import { createUserAddress } from "@/src/lib/finalUser/addresses/actions";
import type { Enums } from "@/src/lib/database.types";

export type NewAddressFormProps = {
  onCancel: () => void;
  onSave?: (data: FormData) => Promise<void>;
};

type LocationType = Enums<"address_location_type">; // "villa" | "yate"
type FormData = {
  location_type: LocationType;
  location_number: string;
  instructions?: string;
};

// agregar el OnSave para cuando tenga la función hecha
export default function AddressEditForm({ onCancel }: NewAddressFormProps) {
  const [formData, setFormData] = useState<FormData>({
    location_type: "villa",
    location_number: "",
    instructions: "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new window.FormData();
    fd.set("location_type", formData.location_type);
    fd.set("location_number", formData.location_number);
    if (formData.instructions) fd.set("instructions", formData.instructions);
    startTransition(async () => {
      const res = await createUserAddress(fd);
      if (!res.success) {
        setError(res.error || "No se pudo guardar");
        return;
      }
      onCancel();
    });
  };

  return (
    <>
      <header className="flex items-center p-4 border-gray-00 flex-shrink-0">
        <button
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-black/20"
        >
          <ArrowIcon />
        </button>
        <h2 id="address-panel-title" className="text-xl font-bold px-4 w-full">
          Direcciones
        </h2>
      </header>
      <form onSubmit={handleSubmit} className="flex flex-col grow">
        <div className="grow">
          {/* Campo: Tipo de lugar */}
          <div className="p-4 font-roboto">
            <h3 className="text-base font-bold mb-4 font-poppins">
              Nueva dirección
            </h3>
            <label
              htmlFor="location_type"
              className="block text-sm font-semibold text-gray-700 pb-1"
            >
              Tipo de lugar
            </label>
            <select
              id="location_type"
              name="location_type"
              value={formData.location_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location_type: e.target.value as LocationType,
                })
              }
              className="block w-full border border-gray-300 rounded-xl py-2 px-3 appearance-none"
            >
              <option value="villa">Villa</option>
              <option value="yate">Yate</option>
            </select>

            {/* Campo: Número de villa/yate */}
            <label
              htmlFor="location_number"
              className="block text-sm text-gray-700 pt-4 pb-1 font-semibold"
            >
              Número de {formData.location_type === "yate" ? "yate" : "villa"}
            </label>
            <input
              id="location_number"
              name="location_number"
              value={formData.location_number}
              onChange={(e) =>
                setFormData({ ...formData, location_number: e.target.value })
              }
              placeholder="Ej. 23A, 5, #7"
              className="block w-full rounded-xl border-gray-300 shadow-sm border py-2 px-3"
            />

            {/* Campo: Instrucciones especiales */}
            <div>
              <label
                htmlFor="instructions"
                className="block text-sm text-gray-700 pt-4 pb-1 font-semibold"
              >
                Instrucciones especiales para la entrega
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={4}
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
                placeholder="Ingresa la información"
                className="block w-full rounded-xl border-gray-300 shadow-sm border py-2 px-3 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <footer className="p-4 flex-shrink-0">
          {error ? <p className="text-sm text-red-600 mb-2">{error}</p> : null}
          <button
            disabled={isPending}
            className="w-full bg-primary text-white font-medium py-3 rounded-2xl text-center hover:bg-[#15803d] transition-colors disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar dirección"}
          </button>
        </footer>
      </form>
    </>
  );
}
