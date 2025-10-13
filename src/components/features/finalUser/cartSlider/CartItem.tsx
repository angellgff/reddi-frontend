"use client";

import Image from "next/image";
import { useAppDispatch } from "@/src/lib/store/hooks";
import {
  CartItem as CartItemType,
  removeItem,
  setQuantity,
  removeExtraFromItem,
  addExtraToItem,
} from "@/src/lib/store/cartSlice";
import {
  incrementExtraQuantity,
  decrementExtraQuantity,
} from "@/src/lib/store/cartSlice";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { Tables } from "@/src/lib/database.types";

export default function CartItem({ item }: { item: CartItemType }) {
  const dispatch = useAppDispatch();
  const increase = () =>
    dispatch(setQuantity({ id: item.id, quantity: item.quantity + 1 }));
  const decrease = () =>
    dispatch(
      setQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) })
    );

  // Cargar secciones y opciones (extras disponibles) del producto
  type ExtraOption = {
    optionId: string; // product_section_options.id
    extraId: string; // product_extras.id
    name: string;
    imageUrl: string | null;
    price: number; // override_price ?? default_price
    displayOrder: number;
  };
  type Section = {
    id: string;
    name: string;
    isRequired: boolean;
    displayOrder: number;
    options: ExtraOption[];
  };
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchSections = async () => {
      try {
        setLoadingExtras(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("product_sections")
          .select(
            `id,name,is_required,display_order,
             product_section_options (
               id,override_price,display_order,
               product_extras ( id,name,image_url,default_price )
             )`
          )
          .eq("product_id", item.productId)
          .order("display_order", { ascending: true });
        if (error) throw error;
        if (cancelled) return;
        type SectionRow = Tables<"product_sections"> & {
          product_section_options: Array<{
            id: string;
            override_price: number | null;
            display_order: number;
            product_extras: Tables<"product_extras"> | null;
          }>;
        };
        const rows = (data as unknown as SectionRow[] | null) ?? [];
        const mapped: Section[] = rows.map((s) => ({
          id: s.id,
          name: s.name,
          isRequired: !!s.is_required,
          displayOrder: s.display_order ?? 0,
          options: (s.product_section_options || [])
            .filter((o) => Boolean(o.product_extras))
            .map((o) => {
              const extra = o.product_extras!;
              const price =
                typeof o.override_price === "number" && !isNaN(o.override_price)
                  ? Number(o.override_price)
                  : Number(extra.default_price ?? 0);
              return {
                optionId: o.id,
                extraId: extra.id,
                name: extra.name,
                imageUrl: extra.image_url ?? null,
                price,
                displayOrder: o.display_order ?? 0,
              } as ExtraOption;
            })
            .sort(
              (a: ExtraOption, b: ExtraOption) =>
                a.displayOrder - b.displayOrder
            ),
        }));
        setSections(mapped);
      } catch {
        // noop: en UI ignoramos para no romper carrito
      } finally {
        if (!cancelled) setLoadingExtras(false);
      }
    };
    fetchSections();
    return () => {
      cancelled = true;
    };
    // item.productId es la dependencia; si cambia, volvemos a cargar
  }, [item.productId]);

  const unitWithExtras = useMemo(() => {
    const extras = item.extras.reduce(
      (sum, ex) => sum + (Number(ex.price) || 0) * (ex.quantity || 0),
      0
    );
    return item.unitPrice + extras;
  }, [item.unitPrice, item.extras]);

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
              ${(unitWithExtras * item.quantity).toFixed(2)}
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
          <div className="space-y-2">
            {item.extras.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={ex.imageUrl || "/placeholder-food.png"}
                      alt={ex.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {ex.name}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {ex.price > 0
                        ? `$${ex.price.toFixed(2)} c/u`
                        : "Incluido"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      dispatch(
                        decrementExtraQuantity({
                          id: item.id,
                          extraId: ex.extraId,
                        })
                      )
                    }
                    className="h-7 w-7 rounded-full border grid place-items-center"
                    aria-label={`Disminuir ${ex.name}`}
                  >
                    -
                  </button>
                  <div className="min-w-6 text-center text-xs">
                    {ex.quantity}
                  </div>
                  <button
                    onClick={() =>
                      dispatch(
                        incrementExtraQuantity({
                          id: item.id,
                          extraId: ex.extraId,
                        })
                      )
                    }
                    className="h-7 w-7 rounded-full border grid place-items-center"
                    aria-label={`Aumentar ${ex.name}`}
                  >
                    +
                  </button>
                  <button
                    className="text-[11px] underline text-gray-600 ml-1"
                    onClick={() =>
                      dispatch(
                        removeExtraFromItem({ id: item.id, extraId: ex.id })
                      )
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extras disponibles (por secciones) */}
      <div className="mt-3 space-y-2">
        {loadingExtras ? (
          <div className="text-xs text-gray-500">Cargando extras…</div>
        ) : sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <div className="text-xs font-medium text-gray-700">
                {section.name}
                {section.isRequired ? (
                  <span className="ml-1 text-[10px] text-red-500">
                    (requerido)
                  </span>
                ) : null}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {section.options.map((opt) => {
                  const selected = item.extras.find(
                    (e) => e.extraId === opt.extraId
                  );
                  const priceLabel =
                    opt.price > 0 ? `$${opt.price.toFixed(2)}` : "Incluido";
                  return (
                    <div
                      key={opt.optionId}
                      className={`min-w-32 rounded-lg border p-2 text-center hover:shadow transition ${
                        selected ? "ring-2 ring-primary/60" : ""
                      }`}
                    >
                      <div className="h-12 w-full bg-gray-100 rounded mb-1 overflow-hidden">
                        <Image
                          src={opt.imageUrl || "/placeholder-food.png"}
                          alt={opt.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="text-xs font-medium truncate">
                        {opt.name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {priceLabel}
                      </div>
                      {!selected ? (
                        <button
                          type="button"
                          className="mt-2 w-full text-[11px] py-1 rounded border bg-white hover:bg-gray-50"
                          onClick={() =>
                            dispatch(
                              addExtraToItem({
                                id: item.id,
                                extra: {
                                  imageUrl: opt.imageUrl,
                                  extraId: opt.extraId,
                                  name: opt.name,
                                  price: opt.price,
                                },
                              })
                            )
                          }
                        >
                          Agregar
                        </button>
                      ) : (
                        <div className="mt-2 text-[11px] text-green-600">
                          Agregado
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
}
