// components/AddressEditForm.tsx
"use client";

// importar useTransition si decido usarlo
import { useState, useTransition, useEffect } from "react";
import ArrowIcon from "@/src/components/icons/ArrowIcon";
import {
  createUserAddress,
  updateUserAddress,
} from "@/src/lib/finalUser/addresses/actions";
import type { Enums, Tables } from "@/src/lib/database.types";
import LocationPickerMap from "@/src/components/features/partner/register/LocationPickerMap";

export type UserAddress = Tables<"user_addresses">;

export type NewAddressFormProps = {
  onCancel: () => void;
  initialData?: UserAddress | null;
};

type LocationType = Enums<"address_location_type">; // "villa" | "yate"
type FormData = {
  location_type: LocationType;
  location_number: string;
  lat?: number | null;
  lng?: number | null;
};

function parseWKBPoint(value: unknown): { lat: number; lng: number } | null {
  try {
    if (typeof value !== "string") return null;
    const hex = value;
    if (!hex) return null;
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    // Minimum length for Point (21 bytes = 42 hex chars) without SRID, or 25 bytes (50 hex) with SRID
    if (cleanHex.length < 42) return null;

    const bytes = new Uint8Array(
      cleanHex.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16))
    );
    const view = new DataView(bytes.buffer);
    const littleEndian = view.getUint8(0) === 1;

    const type = view.getUint32(1, littleEndian);
    // Check for SRID flag (0x20000000) in EWKB
    const hasSrid = (type & 0x20000000) !== 0;

    // 1 byte endian + 4 bytes type + (4 bytes SRID if present)
    const offset = hasSrid ? 9 : 5;

    const lng = view.getFloat64(offset, littleEndian);
    const lat = view.getFloat64(offset + 8, littleEndian);

    return { lat, lng };
  } catch (e) {
    console.error("Error parsing WKB", e);
    return null;
  }
}

// agregar el OnSave para cuando tenga la función hecha
export default function AddressEditForm({
  onCancel,
  initialData,
}: NewAddressFormProps) {
  const [formData, setFormData] = useState<FormData>({
    location_type: "villa",
    location_number: "",
    lat: null,
    lng: null,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const coords = initialData.coordinates
        ? parseWKBPoint(initialData.coordinates)
        : null;
      setFormData({
        location_type: (initialData.location_type as LocationType) || "villa",
        location_number: initialData.location_number || "",
        lat: coords?.lat || null,
        lng: coords?.lng || null,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new window.FormData();
    fd.set("location_type", formData.location_type);
    fd.set("location_number", formData.location_number);
    if (formData.lat) fd.set("lat", String(formData.lat));
    if (formData.lng) fd.set("lng", String(formData.lng));

    startTransition(async () => {
      let res;
      if (initialData?.id) {
        res = await updateUserAddress(initialData.id, fd);
      } else {
        res = await createUserAddress(fd);
      }

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
              {initialData ? "Editar dirección" : "Nueva dirección"}
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
              <option value="piscina">Piscina</option>
              <option value="habitacion de hotel">Habitación de Hotel</option>
              <option value="muelle de yate">Muelle de Yate</option>
            </select>

            {/* Campo: Número de villa/yate */}
            <label
              htmlFor="location_number"
              className="block text-sm text-gray-700 pt-4 pb-1 font-semibold"
            >
              {formData.location_type === "habitacion de hotel"
                ? "Número de habitación"
                : formData.location_type === "muelle de yate"
                ? "Número de muelle"
                : `Número de ${formData.location_type}`}
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

            {/* Mapa de Ubicación */}
            <div className="space-y-2 mt-4">
              <label className="block text-sm font-semibold text-gray-700">
                Ubicación exacta
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
            </div>

            {/* Campo: Instrucciones especiales - ELIMINADO PORQUE NO EXISTE EN DB */}
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
