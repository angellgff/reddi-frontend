"use client";

import { useState } from "react";
import EditPartnerIcon from "@/src/components/icons/EditPartnertIcon";
import BasicInput from "@/src/components/basics/BasicInput";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import { updatePartnerMarkup } from "@/src/lib/partner/actions/updateMarkup";

interface CommissionsCardValueProps {
  partnerId: string;
  markup: number;
  commission: number;
}

export default function CommissionsCardValue({
  partnerId,
  markup,
  commission,
}: CommissionsCardValueProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMarkup, setNewMarkup] = useState(markup);
  const [isLoading, setIsLoading] = useState(false);

  // Example calculation base
  const EXAMPLE_BASE_PRICE = 10000;
  
  const calculatedDisplayPrice = EXAMPLE_BASE_PRICE * (1 + newMarkup / 100);
  const platformFee = EXAMPLE_BASE_PRICE * (commission / 100);
  const partnerReceives = calculatedDisplayPrice - platformFee;

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await updatePartnerMarkup(partnerId, newMarkup);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el margen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl font-bold text-gray-900">
        {commission}% / {markup}%
      </span>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Editar margen"
      >
        <EditPartnerIcon className="w-4 h-4 text-gray-500" />
      </button>

      {/* Modal manually implemented or use a Dialog component if available. 
          Using a custom modal structure matching ConfirmModal style roughly or creating a new one.
          Constructing a simple modal here using fixed positioning for speed, 
          or reusing ConfirmModal if it supports custom content (it usually doesn't).
          Let's assume we need a custom simple modal div.
      */}
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Configurar Comisiones
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión de Plataforma (Fija)
                </label>
                <BasicInput
                  id="platform-fee"
                  label="Porcentaje asignado"
                  value={`${commission}%`}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este porcentaje es cobrado por Reddi sobre el precio base.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tu Margen al Cliente (%)
                </label>
                <BasicInput
                  id="markup-fee"
                  label="Porcentaje de ganancia"
                  type="number"
                  value={newMarkup.toString()}
                  onChange={(e) => setNewMarkup(Number(e.target.value))}
                  min={0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Incremento sobre tu precio base que paga el cliente.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm text-blue-900">
                <h4 className="font-semibold border-b border-blue-200 pb-2">
                  Ejemplo de Cálculo
                </h4>
                <div className="flex justify-between">
                  <span>Precio Base Producto:</span>
                  <span>${EXAMPLE_BASE_PRICE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Precio al Cliente (+{newMarkup}%):</span>
                  <span>${calculatedDisplayPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-blue-700 mt-1 pt-1 border-t border-blue-200">
                  <span>Comisión Reddi ({commission}% sobre base):</span>
                  <span>-${platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-green-700 pt-1">
                  <span>Recibes (aprox):</span>
                  <span>${partnerReceives.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
