"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Banknote, CreditCard, X } from "lucide-react";
import { completeDeliveryAction } from "@/src/lib/actions/delivery";

interface Props {
  orderId: string;
  driverId: string;
  initialMethod?: "cash" | "physical_pos";
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeliveryCollectionModal({
  orderId,
  driverId,
  initialMethod = "cash",
  totalAmount,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [selectedMethod, setSelectedMethod] = useState<"cash" | "physical_pos">(initialMethod);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(initialMethod);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, initialMethod]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    console.log("Calling Server Action for order:", orderId);

    try {
      const result = await completeDeliveryAction(orderId, driverId, selectedMethod);

      if (!result.success) {
        throw new Error(result.error);
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error completing delivery:", err);
      setError(err.message || "Error al procesar el cobro.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-full">
                {/* Header Impactante */}
                <div className="bg-emerald-600 px-4 py-6 text-center text-white relative">
                  <button
                    type="button"
                    className="absolute right-4 top-4 text-emerald-200 hover:text-white"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-emerald-100">
                    Total a Cobrar
                  </Dialog.Title>
                  <div className="mt-2 text-4xl font-bold tracking-tight">
                    {formatCurrency(totalAmount)}
                  </div>
                  <p className="mt-1 text-sm text-emerald-100 opacity-80">
                    Confirma el método de pago recibido
                  </p>
                </div>

                <div className="px-4 pb-4 pt-5 sm:p-6">
                  {/* Selector de Método */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod("cash")}
                      className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                        selectedMethod === "cash"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <Banknote className="h-8 w-8 mb-2" />
                      <span className="font-semibold text-sm">Efectivo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod("physical_pos")}
                      className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                        selectedMethod === "physical_pos"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard className="h-8 w-8 mb-2" />
                      <span className="font-semibold text-sm">Datáfono</span>
                    </button>
                  </div>

                  {/* Feedback Visual */}
                  <div className="mt-6">
                    {selectedMethod === "cash" && (
                      <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Atención</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>Recibe el dinero antes de confirmar. Este monto se sumará a tu deuda pendiente.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedMethod === "physical_pos" && (
                      <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Verificación</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>Asegúrate de que la transacción fue <strong>APROBADA</strong> en el datáfono antes de continuar.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleConfirm}
                  >
                    {loading ? "Procesando..." : "Confirmar Cobro y Entrega"}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-4 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
