"use client";

import Image from "next/image";
import { useAppDispatch } from "@/src/lib/store/hooks";
import {
  CartItem as CartItemType,
  removeItem,
  setQuantity,
  removeExtraFromItem,
} from "@/src/lib/store/cartSlice";

export default function CartItem({ item }: { item: CartItemType }) {
  const dispatch = useAppDispatch();
  const increase = () =>
    dispatch(setQuantity({ id: item.id, quantity: item.quantity + 1 }));
  const decrease = () =>
    dispatch(
      setQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) })
    );

  return (
    <div className="rounded-xl border p-3">
      <div className="flex gap-3">
        <div className="relative h-16 w-20 rounded-lg overflow-hidden bg-gray-100">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-semibold truncate">{item.name}</div>
            <div className="text-sm font-semibold">
              ${(item.unitPrice * item.quantity).toFixed(2)}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Hamburguesa de carne de...
          </div>
          {/* Controles */}
          <div className="mt-2 flex items-center justify-between">
            <button
              className="text-xs underline text-gray-600"
              onClick={() => dispatch(removeItem({ id: item.id }))}
            >
              Eliminar
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={decrease}
                className="h-7 w-7 rounded-full border grid place-items-center"
                aria-label="Disminuir"
              >
                -
              </button>
              <div className="min-w-6 text-center text-sm">{item.quantity}</div>
              <button
                onClick={increase}
                className="h-7 w-7 rounded-full border grid place-items-center"
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Extras seleccionados */}
      {item.extras.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-600 mb-2">Editar</div>
          <div className="flex gap-3 overflow-x-auto">
            {item.extras.map((ex) => (
              <div
                key={ex.id}
                className="min-w-24 rounded-lg border p-2 text-center cursor-pointer hover:shadow"
                onClick={() =>
                  dispatch(removeExtraFromItem({ id: item.id, extraId: ex.id }))
                }
              >
                <div className="h-12 w-full bg-gray-100 rounded mb-1" />
                <div className="text-xs font-medium truncate">{ex.name}</div>
                <div className="text-[10px] text-gray-500">
                  {ex.price > 0 ? `$${ex.price.toFixed(2)}` : "Incluido"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
