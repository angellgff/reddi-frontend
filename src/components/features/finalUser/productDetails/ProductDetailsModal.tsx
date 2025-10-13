"use client";

import React, { useEffect, useMemo, useState } from "react";
import Portal from "@/src/components/basics/Portal";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/client";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { addItem, SelectedExtra } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";

type ProductDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  productId: string | null;
  partnerId: string; // Needed to add to cart
};

type SectionOption = {
  id: string; // option id
  extraId: string; // FK to product_extras
  name: string;
  price: number; // override or default
  imageUrl?: string | null;
};

type Section = {
  id: string;
  name: string;
  isRequired: boolean;
  options: SectionOption[];
};

type ProductDetails = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  previous_price: number | null;
  discount_percentage: number | null;
  unit: string;
  estimated_time: string;
  tax_included: boolean;
  sections: Section[];
};

// Raw API shapes returned by the Supabase query used below
type ApiOption = {
  id: string;
  extra_id: string;
  override_price: number | null;
  display_order: number | null;
  product_extras: {
    id: string;
    name: string;
    default_price: number;
    image_url: string | null;
  } | null;
};

type ApiSection = {
  id: string;
  name: string;
  is_required: boolean;
  display_order: number | null;
  product_section_options?: ApiOption[] | null;
};

type ApiProduct = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  previous_price: number | null;
  discount_percentage: number | null;
  unit: string;
  estimated_time: string;
  tax_included: boolean;
  product_sections?: ApiSection[] | null;
};

function formatCurrency(v: number) {
  return `$ ${v.toFixed(2)} USD`;
}

export default function ProductDetailsModal({
  open,
  onClose,
  productId,
  partnerId,
}: ProductDetailsModalProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductDetails | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, number>>({});

  // Load details when opened/product changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!open || !productId) return;
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: prod, error } = await supabase
          .from("products")
          .select(
            `id, name, description, image_url, base_price, previous_price, discount_percentage, unit, estimated_time, tax_included,
            product_sections (id, name, is_required, display_order, product_section_options (id, extra_id, override_price, display_order, product_extras (id, name, default_price, image_url)))`
          )
          .eq("id", productId)
          .single();
        if (error) throw error;
        // Map to ProductDetails
        const P = prod as unknown as ApiProduct;
        const mapped: ProductDetails = {
          id: P.id,
          name: P.name,
          description: P.description,
          image_url: P.image_url,
          base_price: P.base_price,
          previous_price: P.previous_price,
          discount_percentage: P.discount_percentage,
          unit: P.unit,
          estimated_time: P.estimated_time,
          tax_included: P.tax_included,
          sections: (P.product_sections || [])
            .slice()
            .sort(
              (a: ApiSection, b: ApiSection) =>
                (a.display_order ?? 0) - (b.display_order ?? 0)
            )
            .map((s: ApiSection) => ({
              id: s.id,
              name: s.name,
              isRequired: !!s.is_required,
              options: (s.product_section_options || [])
                .slice()
                .sort(
                  (a: ApiOption, b: ApiOption) =>
                    (a.display_order ?? 0) - (b.display_order ?? 0)
                )
                .map((o: ApiOption) => ({
                  id: o.id,
                  extraId: o.extra_id,
                  name: o.product_extras?.name || "Opción",
                  price: Number(
                    (
                      (o.override_price ??
                        o.product_extras?.default_price ??
                        0) as number
                    ).toFixed(2)
                  ),
                  imageUrl: o.product_extras?.image_url ?? null,
                })),
            })),
        };
        setData(mapped);
        // Reset selections & qty on new product
        setSelected({});
        setQuantity(1);
      } catch (err) {
        console.error("Error fetching product details", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [open, productId]);

  // price after discount
  const unitPrice = useMemo(() => {
    if (!data) return 0;
    const base = Number(data.base_price) || 0;
    const d = data.discount_percentage ? Number(data.discount_percentage) : 0;
    return d ? base * (1 - d / 100) : base;
  }, [data]);

  const extrasPerUnitTotal = useMemo(() => {
    if (!data) return 0;
    let total = 0;
    for (const s of data.sections) {
      for (const o of s.options) {
        const qty = selected[o.extraId] || 0;
        if (qty > 0) total += o.price * qty;
      }
    }
    return total;
  }, [data, selected]);

  const subtotal = useMemo(
    () => (unitPrice + extrasPerUnitTotal) * quantity,
    [unitPrice, extrasPerUnitTotal, quantity]
  );

  const requiredSatisfied = useMemo(() => {
    if (!data) return true;
    return data.sections.every((s) => {
      if (!s.isRequired) return true;
      // At least one option in this section selected
      return s.options.some((o) => (selected[o.extraId] || 0) > 0);
    });
  }, [data, selected]);

  const changeQty = (delta: number) =>
    setQuantity((q) => Math.max(1, q + delta));

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

  const toCartExtras = (): SelectedExtra[] => {
    if (!data) return [];
    const list: SelectedExtra[] = [];
    for (const s of data.sections) {
      for (const o of s.options) {
        const qty = selected[o.extraId] || 0;
        if (qty > 0) {
          list.push({
            id: "", // will be set in reducer
            extraId: o.extraId,
            name: o.name,
            price: o.price,
            quantity: qty,
            imageUrl: o.imageUrl,
          });
        }
      }
    }
    return list;
  };

  const addToCart = (openCartAfter: boolean) => {
    if (!data) return;
    const extras = toCartExtras();
    dispatch(
      addItem({
        productId: data.id,
        partnerId,
        name: data.name,
        imageUrl: data.image_url,
        unitPrice: Number(unitPrice.toFixed(2)),
        quantity,
        extras,
        mergeByProduct: true,
      })
    );
    if (openCartAfter) dispatch(openCart());
    onClose();
  };

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 pointer-events-auto">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Centered Panel */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* Header area with image and main info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-56 md:h-72 w-full">
              {data?.image_url ? (
                <Image
                  src={data.image_url}
                  alt={data?.name || "Producto"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            {/* Text */}
            <div className="p-4 md:p-6 space-y-2 overflow-hidden">
              <h3 className="text-xl font-semibold truncate">
                {data?.name || "Producto"}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-bold">
                  {formatCurrency(unitPrice)}{" "}
                  <span className="text-gray-500 text-xs">
                    / {data?.unit || "u"}
                  </span>
                </span>
                {data?.previous_price ? (
                  <span className="text-xs text-gray-400 line-through">
                    ${data.previous_price.toFixed(2)}
                  </span>
                ) : null}
                {data?.discount_percentage ? (
                  <span className="text-xs text-emerald-600">
                    -{data.discount_percentage}%
                  </span>
                ) : null}
              </div>
              {data?.description ? (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {data.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* Options and controls */}
          <div className="flex-1 overflow-y-auto border-t">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">
                Cargando detalles…
              </div>
            ) : !data ? (
              <div className="p-6 text-sm text-red-500">
                No se encontraron detalles del producto.
              </div>
            ) : (
              <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  {data.sections.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Este producto no tiene extras disponibles.
                    </div>
                  ) : (
                    data.sections.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl border overflow-hidden"
                      >
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
            )}
          </div>

          {/* Footer controls */}
          <div className="p-4 border-t flex items-center gap-3 justify-between">
            {/* Qty selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Cantidad</span>
              <div className="flex items-center gap-2 border rounded-full px-3 py-1">
                <button className="text-lg" onClick={() => changeQty(-1)}>
                  -
                </button>
                <span className="w-6 text-center text-sm">{quantity}</span>
                <button className="text-lg" onClick={() => changeQty(1)}>
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                className="px-3 py-2 rounded-lg border text-sm"
                onClick={() => addToCart(false)}
                disabled={!data || loading || !requiredSatisfied}
              >
                Añadir y seguir explorando
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-primary text-white text-sm"
                onClick={() => addToCart(true)}
                disabled={!data || loading || !requiredSatisfied}
              >
                Agregar
              </button>
              <div className="px-3 py-2 rounded-lg bg-gray-100 text-sm font-semibold whitespace-nowrap">
                Subtotal: {formatCurrency(subtotal)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
