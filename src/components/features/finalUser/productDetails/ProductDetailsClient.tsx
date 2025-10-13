"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ProductDetails } from "@/src/lib/finalUser/stores/getProductDetails";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { addItem } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";
import { useRouter } from "next/navigation";

export default function ProductDetailsClient({
  details,
}: {
  details: ProductDetails;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, number>>({});

  const unitPrice = useMemo(() => {
    const base = Number(details.base_price) || 0;
    const d = details.discount_percentage
      ? Number(details.discount_percentage)
      : 0;
    return d ? base * (1 - d / 100) : base;
  }, [details]);

  const extrasPerUnitTotal = useMemo(() => {
    let total = 0;
    for (const s of details.sections) {
      for (const o of s.options) {
        const qty = selected[o.extraId] || 0;
        if (qty > 0) total += o.price * qty;
      }
    }
    return total;
  }, [details.sections, selected]);

  const subtotal = useMemo(
    () => (unitPrice + extrasPerUnitTotal) * quantity,
    [unitPrice, extrasPerUnitTotal, quantity]
  );

  const requiredSatisfied = useMemo(() => {
    return details.sections.every((s) => {
      if (!s.isRequired) return true;
      return s.options.some((o) => (selected[o.extraId] || 0) > 0);
    });
  }, [details.sections, selected]);

  const incOption = (extraId: string) =>
    setSelected((m) => ({ ...m, [extraId]: (m[extraId] || 0) + 1 }));
  const decOption = (extraId: string) =>
    setSelected((m) => {
      const n = { ...m } as Record<string, number>;
      const v = (n[extraId] || 0) - 1;
      if (v <= 0) delete n[extraId];
      else n[extraId] = v;
      return n;
    });

  const addToCartHandler = (openAfter: boolean) => {
    const extras = details.sections.flatMap((s) =>
      s.options
        .filter((o) => (selected[o.extraId] || 0) > 0)
        .map((o) => ({
          id: "",
          extraId: o.extraId,
          name: o.name,
          price: o.price,
          quantity: selected[o.extraId],
          imageUrl: o.imageUrl,
        }))
    );
    dispatch(
      addItem({
        productId: details.id,
        partnerId: details.partnerId,
        name: details.name,
        imageUrl: details.image_url,
        unitPrice: Number(unitPrice.toFixed(2)),
        quantity,
        extras,
        mergeByProduct: true,
      })
    );
    if (openAfter) dispatch(openCart());
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="rounded-2xl border overflow-hidden bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: image */}
          <div className="relative h-56 md:h-80 w-full">
            {details.image_url ? (
              <Image
                src={details.image_url}
                alt={details.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>

          {/* Right: main info + extras under description */}
          <div className="p-4 md:p-6 space-y-2">
            <h1 className="text-xl font-semibold">{details.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 font-bold">
                $ {unitPrice.toFixed(2)}{" "}
                <span className="text-gray-500 text-xs">/ {details.unit}</span>
              </span>
              {details.previous_price ? (
                <span className="text-xs text-gray-400 line-through">
                  ${details.previous_price.toFixed(2)}
                </span>
              ) : null}
              {details.discount_percentage ? (
                <span className="text-xs text-emerald-600">
                  -{details.discount_percentage}%
                </span>
              ) : null}
            </div>
            {details.description ? (
              <p className="text-sm text-gray-600">{details.description}</p>
            ) : null}

            {/* Extras in the same column, below description */}
            <div className="mt-4 space-y-4">
              {details.sections.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Este producto no tiene extras disponibles.
                </div>
              ) : (
                details.sections.map((s) => (
                  <div key={s.id} className="rounded-xl border overflow-hidden">
                    <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                      <span className="text-sm font-medium">{s.name}</span>
                      {s.isRequired ? (
                        <span className="text-[11px] text-emerald-600">
                          Requerido
                        </span>
                      ) : null}
                    </div>
                    <ul className="divide-y">
                      {s.options.map((o) => {
                        const qty = selected[o.extraId] || 0;
                        return (
                          <li
                            key={o.id}
                            className="px-4 py-3 flex items-center gap-3 justify-between"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {o.imageUrl ? (
                                <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                  <Image
                                    src={o.imageUrl}
                                    alt={o.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-md" />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {o.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  + ${o.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="w-8 h-8 rounded-full border text-lg leading-none disabled:opacity-50"
                                onClick={() => decOption(o.extraId)}
                                disabled={qty === 0}
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm">
                                {qty}
                              </span>
                              <button
                                className="w-8 h-8 rounded-full border text-lg leading-none"
                                onClick={() => incOption(o.extraId)}
                              >
                                +
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-4 md:p-6 border-t flex items-center justify-between gap-3">
          <button
            className="px-3 py-2 rounded-lg border text-sm"
            onClick={() => router.back()}
          >
            Volver
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 border rounded-full px-3 py-1">
              <button
                className="text-lg"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </button>
              <span className="w-6 text-center text-sm">{quantity}</span>
              <button
                className="text-lg"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
            <button
              className="px-3 py-2 rounded-lg border text-sm"
              disabled={!requiredSatisfied}
              onClick={() => addToCartHandler(false)}
            >
              Añadir y seguir explorando
            </button>
            <button
              className="px-3 py-2 rounded-lg bg-primary text-white text-sm"
              disabled={!requiredSatisfied}
              onClick={() => addToCartHandler(true)}
            >
              Agregar
            </button>
            <div className="px-3 py-2 rounded-lg bg-gray-100 text-sm font-semibold whitespace-nowrap">
              Subtotal: $ {subtotal.toFixed(2)} USD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
