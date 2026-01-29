"use client";

import { useState, useEffect, useTransition, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, MapPin, X } from "lucide-react";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";
import LocationPickerMap from "@/src/components/features/partner/register/LocationPickerMap";
import {
  createUserAddress,
  updateUserAddress,
} from "@/src/lib/finalUser/addresses/actions";
import { Tables } from "@/src/lib/database.types";

type UserAddress = Tables<"user_addresses">;
type LocationType = "Villa" | "Yate" | "Habitación" | "Piscina";

const LOCATION_TYPES: LocationType[] = [
  "Villa",
  "Yate",
  "Habitación",
  "Piscina",
];

function parseWKBPoint(value: unknown): { lat: number; lng: number } | null {
  try {
    if (typeof value !== "string") return null;
    const hex = value;
    if (!hex) return null;
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (cleanHex.length < 42) return null;
    const bytes = new Uint8Array(
      cleanHex.match(/[\da-f]{2}/gi)!.map((h) => parseInt(h, 16)),
    );
    const view = new DataView(bytes.buffer);
    const littleEndian = view.getUint8(0) === 1;
    const type = view.getUint32(1, littleEndian);
    const hasSrid = (type & 0x20000000) !== 0;
    const offset = hasSrid ? 9 : 5;
    const lng = view.getFloat64(offset, littleEndian);
    const lat = view.getFloat64(offset + 8, littleEndian);
    return { lat, lng };
  } catch (e) {
    console.error("Error parsing WKB", e);
    return null;
  }
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function mapDbLocationTypeToUi(dbType: string | null): LocationType {
  if (!dbType) return "Villa";
  const lower = dbType.toLowerCase();
  if (lower === "habitacion de hotel") return "Habitación";
  const cap = capitalize(lower);
  if (LOCATION_TYPES.includes(cap as LocationType)) return cap as LocationType;
  return "Villa";
}

interface CreateAddressFormProps {
  userId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
  initialData?: UserAddress | null;
  shouldRestoreFloatingButton?: boolean;
}

export default function CreateAddressForm({
  userId,
  onCancel,
  onSuccess,
  initialData,
  shouldRestoreFloatingButton = true,
}: CreateAddressFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [locationType, setLocationType] = useState<LocationType>("Villa");
  const [locationNumber, setLocationNumber] = useState("");
  const [sector, setSector] = useState("");
  const [addressName, setAlias] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState<"door" | "hand">(
    "door",
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Coordinates
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [errors, setErrors] = useState<{
    locationNumber?: boolean;
    sector?: boolean;
    alias?: boolean;
    map?: boolean;
  }>({});

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setLocationType(mapDbLocationTypeToUi(initialData.location_type));
      setLocationNumber(initialData.location_number || "");
      setSector(initialData.sector || "");
      setAlias(initialData.alias || "");
      setDeliveryPreference(
        (initialData.delivery_preference as "door" | "hand") || "door",
      );
      setDeliveryInstructions(initialData.delivery_instructions || "");

      const coords = initialData.coordinates
        ? parseWKBPoint(initialData.coordinates)
        : null;
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
      }
    }
  }, [initialData]);

  const { hideButton, showSearch } = useFloatingButtonStore();
  useEffect(() => {
    hideButton();
    return () => {
      if (shouldRestoreFloatingButton) {
        showSearch();
      }
    };
  }, [hideButton, showSearch, shouldRestoreFloatingButton]);

  const handleSave = () => {
    // Validaciones
    const newErrors: typeof errors = {};
    let hasError = false;

    if (!locationNumber.trim()) {
      newErrors.locationNumber = true;
      hasError = true;
    }
    if (!sector.trim()) {
      newErrors.sector = true;
      hasError = true;
    }
    if (!addressName.trim()) {
      newErrors.alias = true;
      hasError = true;
    }
    if (lat === null || lng === null) {
      newErrors.map = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      toast.error(
        "Por favor completa los campos requeridos y selecciona una ubicación en el mapa",
      );
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
      let result;
      if (initialData?.id) {
        result = await updateUserAddress(String(initialData.id), formData);
      } else {
        result = await createUserAddress(formData);
      }

      if (result.success) {
        toast.success(
          initialData
            ? "Dirección actualizada exitosamente"
            : "Dirección guardada exitosamente",
        );
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/user/home");
        }
      } else {
        toast.error(result.error || "Error al guardar la dirección");
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-y-auto px-4 pt-6 pb-Safe">
      {/* Header Title */}
      <div className="flex items-center justify-between mb-6 mt-4">
        <h1 className="text-2xl font-bold text-black">Ingresa tu direccion</h1>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={20} className="text-black" />
          </button>
        )}
      </div>

      {/* Row 1: Type & Number */}
      <div className="flex gap-4 mb-3">
        {/* Type Dropdown */}
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[13px] font-bold text-black ml-1">
            Tipo de lugar
          </label>
          <div className="relative">
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="w-full h-12 bg-[#F4F5F7] rounded-lg px-4 flex items-center justify-between text-left active:scale-[0.99] transition-transform"
            >
              <span className="text-black font-semibold text-[13px]">
                {locationType}
              </span>
              <ChevronDown
                className={`text-black transition-transform ${
                  isTypeDropdownOpen ? "rotate-180" : ""
                }`}
                size={16}
              />
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-30 p-1 flex flex-col gap-1">
                {LOCATION_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Number Input */}
        <div className="flex-[1.2] flex flex-col gap-1">
          <label className="text-[13px] font-bold text-black ml-1">
            Número
          </label>
          <input
            type="text"
            value={locationNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setLocationNumber(e.target.value);
              if (errors.locationNumber) {
                setErrors((prev) => ({ ...prev, locationNumber: undefined }));
              }
            }}
            placeholder={`Ej: ${locationType} #123`}
            className={`w-full h-12 bg-[#F4F5F7] rounded-lg px-4 text-black placeholder:text-gray-400 text-[13px] font-semibold focus:outline-none focus:ring-1 transition-all ${
              errors.locationNumber
                ? "ring-2 ring-red-500 bg-red-50"
                : "focus:ring-primary"
            }`}
          />
        </div>
      </div>

      {/* Info Banner 1 */}
      <div className="flex items-center gap-2 bg-[#FFF9E9] rounded-lg px-4 py-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full border border-black bg-[#FFD263] flex-shrink-0" />
        <span className="text-[10px] font-semibold text-black leading-tight">
          Selecciona tu villa, yate, habitación o piscina
        </span>
      </div>

      {/* Sector Input */}
      <div className="flex flex-col gap-1 mb-6">
        <label className="text-[13px] font-bold text-black ml-1">Sector</label>
        <input
          type="text"
          value={sector}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSector(e.target.value);
            if (errors.sector) {
              setErrors((prev) => ({ ...prev, sector: undefined }));
            }
          }}
          placeholder="Ej: Vivero 2"
          className={`w-full h-12 bg-[#F4F5F7] rounded-lg px-4 text-black placeholder:text-gray-400 text-[13px] font-semibold focus:outline-none focus:ring-1 transition-all ${
            errors.sector ? "ring-2 ring-red-500 bg-red-50" : "focus:ring-primary"
          }`}
        />
      </div>

      {/* Map Section */}
      <div className="flex flex-col gap-1 mb-6">
        <label className="text-[13px] font-bold text-black ml-1">
          Verifica tu dirección
        </label>
        <div
          className={`relative w-full h-[150px] rounded-xl overflow-hidden bg-gray-100 border transition-all ${
            errors.map
              ? "border-red-500 ring-2 ring-red-500"
              : "border-gray-100"
          }`}
        >
          <LocationPickerMap
            lat={lat}
            lng={lng}
            onLocationSelect={(newLat, newLng) => {
              setLat(newLat);
              setLng(newLng);
              if (errors.map) {
                setErrors((prev) => ({ ...prev, map: undefined }));
              }
            }}
            className="w-full h-full"
          />
          {/* Ajusta el pin Button Overlay */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <button
              onClick={() => {
                // Logic to expand map or show modal could go here
                // For now, it just focuses the map area visually
              }}
              className="bg-white px-4 py-1.5 rounded-full shadow-md text-[10px] font-bold text-black flex items-center gap-1 active:scale-95 transition-transform"
            >
              Ajusta el pin
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Preferences / Instructions */}
      <div className="flex flex-col gap-3 mb-6">
        <label className="text-[13px] font-bold text-black ml-1">
          Instrucciones para el repartidor
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => setDeliveryPreference("door")}
            className={`flex-1 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
              deliveryPreference === "door"
                ? "bg-[#DADADA] text-black" // The design shows active as Gray for "Dejar en puerta"? Or maybe my interpretation.
                : // Re-reading design: "Dejar en la puerta" is Gray bg, Black text. "Entrégamelo a mí" is Green bg, White text.
                  // Assuming "Entregamelo a mi" is selected in the screenshot.
                  // Let's implement toggle logic where selected = Green, unselected = Gray.
                  // The screenshot shows one Gray and one Green.
                  "bg-[#F4F5F7] text-gray-500"
            }`}
            // Actually, looking at the image:
            // "Dejar en la puerta" has bg #DADADA (gray) and text Black.
            // "Entregamelo a mi" has bg #04BD88 (green) and text White.
            // This suggests "Entregamelo a mi" is the ACTIVE one.
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setDeliveryPreference("door");
              }}
              className={`w-full h-full flex items-center justify-center rounded-full ${deliveryPreference === "door" ? "bg-[#04BD88] text-white" : "bg-[#DADADA] text-black"}`}
            >
              Dejar en la puerta
            </div>
          </button>

          <button
            onClick={() => setDeliveryPreference("hand")}
            className={`flex-1 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors`}
          >
            <div
              className={`w-full h-full flex items-center justify-center rounded-full ${deliveryPreference === "hand" ? "bg-[#04BD88] text-white" : "bg-[#DADADA] text-black"}`}
            >
              Entrégamelo a mí
            </div>
          </button>
        </div>

        <textarea
          value={deliveryInstructions}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setDeliveryInstructions(e.target.value)
          }
          placeholder="e.j. toca la puerta o el timbre y esperame ahi con el verifone..."
          className="w-full h-20 bg-[#F4F5F7] rounded-lg p-4 text-black placeholder:text-gray-400 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none leading-relaxed"
        />
      </div>

      {/* Address Name */}
      <div className="flex flex-col gap-1 mb-2">
        <label className="text-[13px] font-bold text-black ml-1">
          Nombre de la dirección
        </label>
        <div className="relative">
          <input
            type="text"
            value={addressName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setAlias(e.target.value);
              if (errors.alias) {
                setErrors((prev) => ({ ...prev, alias: undefined }));
              }
            }}
            placeholder="Casa Romana"
            className={`w-full h-10 bg-[#F4F5F7] rounded-lg px-4 text-black placeholder:text-gray-400 text-[13px] font-semibold focus:outline-none focus:ring-1 transition-all pr-10 ${
              errors.alias
                ? "ring-2 ring-red-500 bg-red-50"
                : "focus:ring-primary"
            }`}
          />
          {addressName && (
            <button
              onClick={() => setAlias("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#595959] rounded-full flex items-center justify-center"
            >
              <X size={12} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Info Banner */}
      <div className="bg-[#FFF9E9] rounded-lg p-3 mb-8">
        <p className="text-[10px] font-semibold text-black leading-tight">
          Este nombre te ayuda a identificar y personalizar tus direcciones en
          Reddi. Solo tú puedes verlo y puedes modificarlo cuando quieras.
        </p>
      </div>

      {/* Footer Button */}
      <div className="mt-auto">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full bg-[#04BD88] h-[50px] rounded-2xl text-white text-xl font-bold active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Guardar y continuar" // Text from design
          )}
        </button>
      </div>
    </div>
  );
}
