"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { clearCart } from "@/src/lib/store/cartSlice";
import { resetCheckout } from "@/src/lib/store/checkoutSlice";

interface PaymentStatusViewProps {
  status: "success" | "error";
  message: string;
  orderId?: string;
}

export default function PaymentStatusView({
  status,
  message,
  orderId,
}: PaymentStatusViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "success" && orderId) {
      // 1. Eliminar persistencia inmediatamente para evitar condiciones de carrera
      // con la hidratación (HydrateFromStorage) que corre en el padre.
      // Al ser un efecto hijo, corre antes que el del padre, así que si borramos aquí,
      // el padre leerá null y no restaurará el estado viejo.
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("reddi.cartState.v1");
      }

      // 2. Limpiar estado en memoria (Redux)
      dispatch(clearCart());
      dispatch(resetCheckout());

      const timer = setTimeout(() => {
        router.replace(`/user/orders/${orderId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, orderId, router, dispatch]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center bg-white">
      {status === "success" && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">¡Orden Recibida!</h2>
          <p className="text-gray-600 mt-2 max-w-sm">{message}</p>
          <p className="text-xs text-gray-400 mt-6">
            Serás redirigido a tu pedido en unos segundos...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Hubo un problema</h2>
          <p className="text-red-600 mt-2 font-medium bg-red-50 px-4 py-2 rounded-lg max-w-md break-words">
            {message}
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/user/checkout/address"
              className="px-6 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              Volver al Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
