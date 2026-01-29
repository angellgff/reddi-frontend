"use client";

import Image from "next/image";
import { useAppDispatch } from "@/src/lib/store/hooks";
import {
  CartItem as CartItemType,
  removeItem,
  setQuantity,
  removeExtraFromItem,
  addExtraToItem,
  addItem,
  updateItemNote,
} from "@/src/lib/store/cartSlice";
import {
  incrementExtraQuantity,
  decrementExtraQuantity,
} from "@/src/lib/store/cartSlice";
import { useEffect, useMemo, useState } from "react";
// import { createClient } from "@/src/lib/supabase/client"; // ELIMINADO
// import type { Tables } from "@/src/lib/database.types"; // ELIMINADO
import {
  getCartItemExtras,
  Section,
  ExtraOption,
} from "@/src/lib/actions/finalUser/cart/cart-item-actions";

export default function CartItem({
  item,
  enableExtras = true,
}: {
  item: CartItemType;
  enableExtras?: boolean;
}) {
  const dispatch = useAppDispatch();
  const increase = () => {
    // Aseguramos que quantityStep sea numérico. Si es 0 o indefinido, usamos 1.
    const rawStep = Number(item.quantityStep);
    const step = rawStep > 0 ? rawStep : 1;

    if (enableExtras && item.extras.length > 0) {
      // Nueva regla: si el item tiene extras, agregar una nueva línea base en lugar de sumar cantidad.
      dispatch(
        addItem({
          productId: item.productId,
          partnerId: item.partnerId,
          name: item.name,
          imageUrl: item.imageUrl,
          unitPrice: item.unitPrice,
          quantity: step,
          measurementUnit: item.measurementUnit,
          quantityStep: step,
          minQuantity: item.minQuantity,
          extras: [],
          mergeByProduct: true,
          note: item.note ?? null,
        }),
      );
    } else {
      const next = item.quantity + step;
      dispatch(
        setQuantity({
          id: item.id,
          quantity: Math.round(next * 100) / 100,
        }),
      );
    }
  };
  const decrease = () => {
    // Aseguramos que quantityStep sea numérico.
    const rawStep = Number(item.quantityStep);
    const step = rawStep > 0 ? rawStep : 1;
    // Si no hay minQuantity, el mínimo es el step.
    const min = item.minQuantity || step;
    const next = item.quantity - step;
    dispatch(
      setQuantity({
        id: item.id,
        quantity: next < min ? min : Math.round(next * 100) / 100,
      }),
    );
  };

  const [sections, setSections] = useState<Section[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (!enableExtras) {
      // Si extras están deshabilitados para este partner, vaciamos y salimos
      setSections([]);
      setLoadingExtras(false);
      return;
    }
    let cancelled = false;
    const fetchSections = async () => {
      try {
        setLoadingExtras(true);
        // Usar Server Action en lugar de createClient del lado del cliente
        const mapped = await getCartItemExtras(item.productId);

        if (cancelled) return;
        setSections(mapped);
      } catch (err) {
        console.error("Error loading extras for cart item", err);
      } finally {
        if (!cancelled) setLoadingExtras(false);
      }
    };
    fetchSections();
    return () => {
      cancelled = true;
    };
  }, [item.productId, enableExtras]);

  // Aplanar opciones para mostrarlas (si se desea)

  const unitWithExtras = useMemo(() => {
    if (!enableExtras) return item.unitPrice;
    const extras = item.extras.reduce(
      (sum, ex) => sum + (Number(ex.price) || 0) * (ex.quantity || 0),
      0,
    );
    return item.unitPrice + extras;
  }, [item.unitPrice, item.extras, enableExtras]);

  // Estado para editar nota
  const [editingNote, setEditingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(item.note ?? "");
  const startEditNote = () => {
    setDraftNote(item.note ?? "");
    setEditingNote(true);
  };
  const cancelEditNote = () => {
    setEditingNote(false);
    setDraftNote(item.note ?? "");
  };
  const saveNote = () => {
    dispatch(
      updateItemNote({
        id: item.id,
        note: draftNote.trim() ? draftNote : null,
      }),
    );
    setEditingNote(false);
  };

  // Lista plana de todas las opciones para mostrar en una sola fila
  const flatOptions = useMemo(
    () =>
      sections
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .flatMap((section) =>
          section.options.map((opt) => ({
            ...opt,
            sectionName: section.name,
            sectionRequired: section.isRequired,
            sectionOrder: section.displayOrder,
          })),
        )
        .sort((a, b) =>
          a.sectionOrder !== b.sectionOrder
            ? a.sectionOrder - b.sectionOrder
            : a.displayOrder - b.displayOrder,
        ),
    [sections],
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
              {new Intl.NumberFormat("es-DO", {
                style: "currency",
                currency: "DOP",
              }).format(unitWithExtras * item.quantity)}
            </div>
          </div>
          {/* Variantes */}
          {item.variants && item.variants.length > 0 && (
            <div className="flex flex-col mt-1">
              {item.variants.map((v) => (
                <div key={v.id} className="text-xs text-gray-500">
                  <span className="font-medium">{v.groupName}:</span> {v.name}
                </div>
              ))}
            </div>
          )}
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
              <div className="min-w-6 text-center text-sm">
                {item.quantity}
                {item.measurementUnit && item.measurementUnit !== "unit"
                  ? ` ${item.measurementUnit}`
                  : ""}
              </div>
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
      {enableExtras && item.extras.length > 0 && (
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
                        ? `${new Intl.NumberFormat("es-DO", {
                            style: "currency",
                            currency: "DOP",
                          }).format(ex.price)} c/u`
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
                        }),
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
                        }),
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
                        removeExtraFromItem({
                          id: item.id,
                          extraId: ex.extraId,
                        }),
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

      {/* Extras disponibles (una sola fila) */}
      {enableExtras && (
        <div className="mt-3">
          {loadingExtras ? (
            <div className="text-xs text-gray-500">Cargando extras…</div>
          ) : flatOptions.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {flatOptions.map((opt) => {
                const selected = item.extras.find(
                  (e) => e.extraId === opt.extraId,
                );
                const priceLabel =
                  opt.price > 0
                    ? new Intl.NumberFormat("es-DO", {
                        style: "currency",
                        currency: "DOP",
                      }).format(opt.price)
                    : "Incluido";
                return (
                  <div
                    key={opt.optionId}
                    className={`w-36 h-48 flex-none overflow-hidden rounded-lg border p-2 text-center hover:shadow transition flex flex-col ${
                      selected ? "ring-2 ring-primary/60" : ""
                    }`}
                  >
                    <div className="h-16 w-full bg-gray-100 rounded mb-2 overflow-hidden">
                      <Image
                        src={opt.imageUrl || "/placeholder-food.png"}
                        alt={opt.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium truncate">
                        {opt.name}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {priceLabel}
                      </div>
                      {/* Badge pequeña con el nombre de la sección para contexto */}
                      <div className="mt-1 text-[10px] text-gray-400 truncate">
                        {opt.sectionName}
                        {opt.sectionRequired ? (
                          <span className="ml-1 text-red-500">*</span>
                        ) : null}
                      </div>
                    </div>
                    <div>
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
                              }),
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
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      )}

      {/* Nota del producto */}
      <div className="mt-3 rounded-lg bg-gray-50 border p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs font-medium text-gray-700">Nota</div>
          {!editingNote && (
            <button
              type="button"
              onClick={startEditNote}
              className="text-[11px] underline text-gray-600"
            >
              {item.note ? "Editar" : "Añadir"}
            </button>
          )}
        </div>
        {!editingNote ? (
          item.note ? (
            <div className="text-xs text-gray-700 whitespace-pre-wrap">
              {item.note}
            </div>
          ) : (
            <div className="text-[11px] text-gray-500">Sin nota</div>
          )
        ) : (
          <div className="space-y-2">
            <textarea
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              rows={3}
              className="w-full rounded-md border px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Ej. Sin cebolla, salsa aparte…"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelEditNote}
                className="px-2 py-1 rounded border text-[11px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveNote}
                disabled={draftNote.trim() === (item.note ?? "")}
                className="px-2 py-1 rounded bg-primary text-white text-[11px] disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
