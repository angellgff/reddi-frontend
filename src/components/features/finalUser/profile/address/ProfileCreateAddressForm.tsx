"use client";

import { useState, useEffect, useTransition, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, X } from "lucide-react";
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

export default function ProfileCreateAddressForm({
  userId,
}: {
  userId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [locationType, setLocationType] = useState<LocationType>("Villa");
  const [locationNumber, setLocationNumber] = useState("");
  const [sector, setSector] = useState("");
  // addressName corresponds to "Nombre de la dirección"
  const [addressName, setAddressName] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState<"door" | "hand">(
    "door",
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const { hideButton, showSearch } = useFloatingButtonStore();

  useEffect(() => {
    hideButton();
    return () => showSearch();
  }, [hideButton, showSearch]);

  const handleSave = () => {
    // Validation
    if (!locationNumber.trim()) {
      toast.error(
        `Por favor ingresa el número de ${locationType.toLowerCase()}`,
      );
      return;
    }
    if (!sector.trim()) {
      toast.error("Por favor ingresa el sector");
      return;
    }
    if (lat === null || lng === null) {
      toast.error("Por favor selecciona una ubicación en el mapa");
      return;
    }
    if (!addressName.trim()) {
      toast.error("Por favor dale un nombre a tu dirección");
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
        // Redirect back to address list
        router.push("/user/address");
        router.refresh();
      } else {
        toast.error(result.error || "Error al guardar la dirección");
      }
    });
  };

  return (
    <div className="w-full bg-white min-h-screen px-4 pt-4 pb-24 font-open-sans">
      <h1 className="text-[24px] font-bold text-black mb-6">
        Ingresa Nueva dirección
      </h1>

      {/* Row 1: Type and Number */}
      <div className="flex gap-4 mb-4">
        {/* Type */}
        <div className="flex-1 relative">
          <label className="block text-[13px] font-bold text-black mb-2">
            Tipo de lugar
          </label>
          <button
            type="button"
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="w-full h-[34px] bg-[#F4F5F7] rounded-lg px-4 flex items-center justify-between"
          >
            <span className="text-[13px] font-semibold text-black/90">
              {locationType}
            </span>
            <ChevronDown size={16} className="text-black" />
          </button>

          {isTypeDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 w-full bg-white border border-gray-100 rounded-lg shadow-lg z-50 overflow-hidden">
              {LOCATION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setLocationType(t);
                    setIsTypeDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Number */}
        <div className="flex-1">
          <label className="block text-[13px] font-bold text-black mb-2">
            Número de {locationType.toLowerCase()}
          </label>
          <div className="w-full h-[34px] bg-[#F4F5F7] rounded-lg px-4 flex items-center">
            <input
              type="text"
              value={locationNumber}
              onChange={(e) => setLocationNumber(e.target.value)}
              placeholder={`Ej: ${locationType === "Villa" ? "273" : "101"}`}
              className="w-full bg-transparent text-[13px] font-semibold text-black/90 focus:outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Warning/Hint Pill (from image: "Selecciona tu villa...") */}
      <div className="w-[228px] h-[28px] bg-[#FFF9E9] rounded-lg flex items-center justify-center px-3 gap-2 mb-4">
        <div className="w-2.5 h-2.5 border border-black rounded-full grid place-items-center bg-[#FFD263]">
          <span className="text-[8px] font-bold">!</span>
        </div>
        <span className="text-[9px] font-semibold text-black/90">
          Selecciona tu villa, yate, habitación o piscina
        </span>
      </div>

      {/* Sector */}
      <div className="mb-6">
        <label className="block text-[13px] font-bold text-black mb-2">
          Sector
        </label>
        <div className="w-full h-[34px] bg-[#F4F5F7] rounded-lg px-4 flex items-center">
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Vivero 2"
            className="w-full bg-transparent text-[13px] font-semibold text-[#484848]/90 focus:outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Map */}
      <div className="mb-6">
        <label className="block text-[13px] font-bold text-black mb-2">
          Verifica tu dirección
        </label>
        <div className="relative w-full h-[151px] rounded-[11px] overflow-hidden border border-gray-100">
          {/* Map Component */}
          <LocationPickerMap
            lat={lat}
            lng={lng}
            onLocationSelect={(l, n) => {
              setLat(l);
              setLng(n);
            }}
            className="w-full h-full"
          />

          {/* Adjust Pin Overlay Button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="bg-white rounded-[19.5px] shadow-[0px_1px_9.9px_rgba(0,0,0,0.25)] px-4 py-1.5 flex items-center justify-center pointer-events-auto">
              <span className="text-[10px] font-bold text-black">
                Ajusta el pin
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Instructions */}
      <div className="mb-4">
        <label className="block text-[13px] font-bold text-black mb-2">
          Instrucciones para el repartidor
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setDeliveryPreference("door")}
            className={`flex-1 h-[39px] rounded-[24px] flex items-center justify-center text-[13px] font-bold transition-colors ${
              deliveryPreference === "door"
                ? "bg-[#DADADA] text-black ring-2 ring-gray-400"
                : "bg-[#DADADA] text-black"
            } ${
              // Wait, design has "Dejar en la puerta" as Gray and "Entregamelo a mi" as Green.
              // Assuming "Dejar en la puerta" is selected in one state?
              // The image shows both. "Dejar en la puerta" (Gray) | "Entregamelo a mi" (Green).
              // Usually these are toggles. If I select "Dejar en la puerta", it should probably turn Green or distinctive?
              // Or maybe the design shows the UNSELECTED state in Gray and SELECTED in Green?
              // Let's implement traditional toggle logic with these colors.
              deliveryPreference === "door" ? "!bg-black !text-white" : ""
            }`}
            style={
              deliveryPreference === "door"
                ? {}
                : { backgroundColor: "#DADADA", color: "#000000" }
            }
          >
            Dejar en la puerta
          </button>

          <button
            onClick={() => setDeliveryPreference("hand")}
            className={`flex-1 h-[39px] rounded-[24px] flex items-center justify-center text-[13px] font-bold transition-colors`}
            style={
              deliveryPreference === "hand"
                ? { backgroundColor: "#04BD88", color: "#FFFFFF" }
                : { backgroundColor: "#DADADA", color: "#000000" }
            }
          >
            Entrégamelo a mí
          </button>
        </div>
      </div>

      {/* Textarea for instructions */}
      <div className="mb-6">
        <div className="w-full h-[74px] bg-[#F4F5F7] rounded-lg px-4 py-2">
          <textarea
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
            placeholder="e.j. toca la puerta o el timbre y esperame ahi con el verifone para pagar en tarjeta, dejalo en la puerta..."
            className="w-full h-full bg-transparent text-[11px] font-semibold text-[#484848]/90 focus:outline-none placeholder:text-gray-400 resize-none leading-[182%]"
          />
        </div>
      </div>

      {/* Address Name */}
      <div className="mb-8">
        <label className="block text-[13px] font-bold text-black mb-2">
          Nombre de la dirección
        </label>
        <div className="relative w-full h-[57px] bg-[#F4F5F7] rounded-lg px-4 flex items-center">
          <input
            type="text"
            value={addressName}
            onChange={(e) => setAddressName(e.target.value)}
            placeholder="Casa Romana"
            className="w-full bg-transparent text-[13px] font-semibold text-black focus:outline-none placeholder:text-gray-400"
          />
          {addressName && (
            <button
              onClick={() => setAddressName("")}
              className="bg-[#595959] rounded-full p-0.5 ml-2"
            >
              <X size={12} className="text-white" />
            </button>
          )}
        </div>
        <div className="mt-2 text-[10px] leading-[200%] text-black bg-[#FFF9E9] rounded-lg p-3">
          <span className="font-bold">
            Este nombre te ayuda a identificar y personalizar tus direcciones en
            Reddi.
          </span>{" "}
          Solo tú puedes verlo y puedes modificarlo cuando quieras.
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-8 left-0 w-full px-4 md:px-0 md:relative md:bottom-auto">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full h-[50px] bg-[#E8C500] rounded-[18px] text-white text-[20px] font-bold flex items-center justify-center disabled:opacity-70 shadow-md"
        >
          {isPending ? "Guardando..." : "Guardar y continuar"}
        </button>
      </div>
    </div>
  );
}
