"use client";

import { useState, useEffect, useTransition, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, MapPin, X } from "lucide-react";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";
import LocationPickerMap from "@/src/components/features/partner/register/LocationPickerMap";
import { createUserAddress } from "@/src/lib/finalUser/addresses/actions";

type LocationType = "Villa" | "Yate" | "Habitación" | "Piscina";

const LOCATION_TYPES: LocationType[] = [
  "Villa",
  "Yate",
  "Habitación",
  "Piscina",
];

export default function CreateAddressForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [locationType, setLocationType] = useState<LocationType>("Villa");
  const [locationNumber, setLocationNumber] = useState("");
  const [sector, setSector] = useState("");
  const [addressName, setAlias] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState<"door" | "hand">(
    "door"
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Coordinates
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const { hideButton, showSearch } = useFloatingButtonStore();
  useEffect(() => {
    hideButton();
    return () => showSearch();
  }, [hideButton, showSearch]);

  const handleSave = () => {
    if (!locationNumber.trim()) {
      toast.error(
        "Por favor ingresa el número de " + locationType.toLowerCase()
      );
      return;
    }
    if (!sector.trim()) {
      toast.error("Por favor ingresa el sector");
      return;
    }
    if (!addressName.trim()) {
      toast.error("Por favor dale un nombre a tu dirección");
      return;
    }
    if (lat === null || lng === null) {
      toast.error("Por favor selecciona una ubicación en el mapa");
      return;
    }

    let typeValue = locationType.toLowerCase();
    if (locationType === "Habitación") typeValue = "habitacion de hotel";

    const formData = new FormData();
    formData.append("location_type", typeValue);
    formData.append("location_number", locationNumber);
    formData.append("sector", sector);
    formData.append("alias", addressName);
    formData.append("delivery_preference", deliveryPreference);
    formData.append("delivery_instructions", deliveryInstructions);
    formData.append("lat", String(lat));
    formData.append("lng", String(lng));

    startTransition(async () => {
      const result = await createUserAddress(formData);
      if (result.success) {
        toast.success("Dirección guardada exitosamente");
        router.push("/user/home");
      } else {
        toast.error(result.error || "Error al guardar la dirección");
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
      {/* Map Section - 35% height */}
      <div className="relative h-[35vh] w-full bg-gray-100 shrink-0">
        <LocationPickerMap
          lat={lat}
          lng={lng}
          onLocationSelect={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
          className="w-full h-full"
        />

        {/* Back Button Overlay */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <X size={24} className="text-black" />
        </button>
      </div>

      {/* Form Section - Radius Top */}
      <div className="flex-1 bg-white -mt-6 rounded-t-3xl relative z-20 px-6 pt-8 pb-Safe flex flex-col gap-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">
            TIPO DE UBICACIÓN
          </label>
          <div className="relative">
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="w-full h-12 bg-white border border-gray-200 rounded-2xl px-4 flex items-center justify-between text-left active:scale-[0.99] transition-transform"
            >
              <span className="text-gray-900 font-medium">{locationType}</span>
              <ChevronDown
                className={`text-gray-400 transition-transform ${
                  isTypeDropdownOpen ? "rotate-180" : ""
                }`}
                size={20}
              />
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-1 flex flex-col gap-1">
                {LOCATION_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      locationType === type
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setLocationType(type);
                      setIsTypeDropdownOpen(false);
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium ml-1">
              NÚMERO
            </label>
            <input
              type="text"
              value={locationNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLocationNumber(e.target.value)
              }
              placeholder="Ej: 12"
              className="w-full h-12 bg-white border border-gray-200 rounded-2xl px-4 text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex-[1.5] flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium ml-1">
              SECTOR
            </label>
            <input
              type="text"
              value={sector}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSector(e.target.value)
              }
              placeholder="Ej: Altos..."
              className="w-full h-12 bg-white border border-gray-200 rounded-2xl px-4 text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">
            NOMBRE DE LA DIRECCIÓN
          </label>
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={addressName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAlias(e.target.value)
              }
              placeholder="Ej: Casa principal, Oficina..."
              className="w-full h-12 bg-white border border-gray-200 rounded-2xl pl-11 pr-4 text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Delivery Preferences */}
        <div className="flex flex-col gap-3 mt-2">
          <label className="text-xs text-gray-500 font-medium ml-1">
            PREFERENCIA DE ENTREGA
          </label>

          <button
            onClick={() => setDeliveryPreference("door")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              deliveryPreference === "door"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-gray-100 bg-white"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                deliveryPreference === "door"
                  ? "border-primary"
                  : "border-gray-300"
              }`}
            >
              {deliveryPreference === "door" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span
                className={`text-sm font-semibold ${
                  deliveryPreference === "door"
                    ? "text-primary"
                    : "text-gray-900"
                }`}
              >
                Dejar en puerta
              </span>
              <span className="text-xs text-gray-500">
                El repartidor dejará el pedido en tu entrada
              </span>
            </div>
          </button>

          <button
            onClick={() => setDeliveryPreference("hand")}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
              deliveryPreference === "hand"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-gray-100 bg-white"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                deliveryPreference === "hand"
                  ? "border-primary"
                  : "border-gray-300"
              }`}
            >
              {deliveryPreference === "hand" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <span
                className={`text-sm font-semibold ${
                  deliveryPreference === "hand"
                    ? "text-primary"
                    : "text-gray-900"
                }`}
              >
                Entregar en mano
              </span>
              <span className="text-xs text-gray-500">
                Recibe el pedido directamente del repartidor
              </span>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <label className="text-xs text-gray-500 font-medium ml-1">
            INSTRUCCIONES DE ENTREGA (OPCIONAL)
          </label>
          <textarea
            value={deliveryInstructions}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setDeliveryInstructions(e.target.value)
            }
            placeholder="Ej: Tocar timbre, dejar en recepción..."
            className="w-full h-24 bg-white border border-gray-200 rounded-2xl p-4 text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <div className="mt-auto pt-6">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full bg-primary h-14 rounded-full text-white font-bold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Guardar direcci�n"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
