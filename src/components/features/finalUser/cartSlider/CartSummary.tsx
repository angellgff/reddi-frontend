"use client";

import { useAppSelector } from "@/src/lib/store/hooks";
import { selectCartSubtotal, selectCartItems } from "@/src/lib/store/cartSlice";
import {
  selectShippingFee,
  selectServiceFee,
} from "@/src/lib/store/chargesSlice";

export default function CartSummary() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingFee);
  const serviceFee = useAppSelector(selectServiceFee);
  const total = subtotal + shipping + serviceFee;

  return (
    <div className="space-y-2">
      <Row label="Productos" value={`$${subtotal.toFixed(2)}`} />
      <Row label="Envío" value={`$${shipping.toFixed(2)}`} />
      <Row label="Tarifa de servicio" value={`$${serviceFee.toFixed(2)}`} />
      <div className="border-t pt-2">
        <Row label="Subtotal" value={`$${total.toFixed(2)}`} bold />
      </div>
      <a
        href={items.length === 0 ? undefined : "/user/payment"}
        className={`mt-3 block w-full text-center bg-primary text-white font-medium py-3 rounded-xl ${
          items.length === 0 ? "pointer-events-none opacity-60" : ""
        }`}
      >
        Ir al pago
      </a>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold" : "text-gray-600"}>{label}</span>
      <span className={bold ? "font-semibold" : "text-gray-900"}>{value}</span>
    </div>
  );
}
