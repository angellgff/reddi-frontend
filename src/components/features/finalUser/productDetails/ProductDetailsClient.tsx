"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ProductDetails } from "@/src/lib/finalUser/stores/getProductDetails";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { addItem, selectCartPartnerId } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";
import { useRouter } from "next/navigation";
import Toast from "@/src/components/basics/Toast";

// Componente para renderizar la sección de extras y la nota.
// Lo creamos para no repetir el mismo bloque de código en móvil y escritorio.
const ExtrasAndNoteSection = ({
  details,
  selected,
  collapsed,
  toggleSection,
  incOption,
  decOption,
  note,
  setNote,
}: {
  details: ProductDetails;
  selected: Record<string, number>;
  collapsed: Record<string, boolean>;
  toggleSection: (id: string) => void;
  incOption: (extraId: string) => void;
  decOption: (extraId: string) => void;
  note: string;
  setNote: (note: string) => void;
}) => (
  <div className="space-y-4 mt-4">
    {/* --- INICIO DEL CÓDIGO REINSERTADO --- */}
    {details.sections.length === 0 ? (
      <div className="text-sm text-gray-500">
        Este producto no tiene extras disponibles.
      </div>
    ) : (
      details.sections.map((s) => {
        const isCollapsed = collapsed[s.id];
        return (
          <div key={s.id} className="rounded-xl border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(s.id)}
              className="w-full px-4 py-2 bg-gray-50 flex items-center justify-between text-left"
            >
              <span className="text-sm font-medium flex items-center gap-2">
                {s.name}
                {s.isRequired ? (
                  <span className="text-[11px] text-emerald-600 font-normal">
                    Requerido
                  </span>
                ) : null}
              </span>
              <span className="text-xs text-gray-500">
                {isCollapsed ? "Mostrar" : "Ocultar"}
              </span>
            </button>
            {!isCollapsed && (
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
                        <span className="w-6 text-center text-sm">{qty}</span>
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
            )}
          </div>
        );
      })
    )}

    {/* Input de la nota */}
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Nota para el pedido (opcional)
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ej. Sin cebolla, salsa aparte…"
        rows={3}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
      />
      <div className="mt-1 text-[11px] text-gray-500">
        La nota se guardará junto con este producto en tu carrito.
      </div>
    </div>
    {/* --- FIN DEL CÓDIGO REINSERTADO --- */}
  </div>
);

export default function ProductDetailsClient({
  details,
  partnerType,
}: {
  details: ProductDetails;
  partnerType?: string;
}) {
  const isRestaurant = partnerType === "restaurant";
  const dispatch = useAppDispatch();
  const currentPartnerId = useAppSelector(selectCartPartnerId);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [note, setNote] = useState<string>("");

  const unitPrice = useMemo(() => {
    const base = Number(details.base_price) || 0;
    const d = details.discount_percentage
      ? Number(details.discount_percentage)
      : 0;
    return d ? base * (1 - d / 100) : base;
  }, [details]);

  const extrasPerUnitTotal = useMemo(() => {
    if (!isRestaurant) return 0;
    let total = 0;
    for (const s of details.sections) {
      for (const o of s.options) {
        const qty = selected[o.extraId] || 0;
        if (qty > 0) total += o.price * qty;
      }
    }
    return total;
  }, [details.sections, selected, isRestaurant]);

  const subtotal = useMemo(
    () => (unitPrice + extrasPerUnitTotal) * quantity,
    [unitPrice, extrasPerUnitTotal, quantity]
  );

  const requiredSatisfied = useMemo(() => {
    if (!isRestaurant) return true;
    return details.sections.every((s) => {
      if (!s.isRequired) return true;
      return s.options.some((o) => (selected[o.extraId] || 0) > 0);
    });
  }, [details.sections, selected, isRestaurant]);

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
    // Bloqueo: solo permitir productos de la misma tienda
    if (currentPartnerId && currentPartnerId !== details.partnerId) {
      setToast({
        open: true,
        message:
          "Solo puedes agregar productos de una tienda a la vez. Vacía el carrito para cambiar de tienda.",
        type: "error",
      });
      return;
    }
    const extras = !isRestaurant
      ? []
      : details.sections.flatMap((s) =>
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
        note: note.trim() ? note.trim() : null,
      })
    );
    if (openAfter) dispatch(openCart());
  };

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleSection = (id: string) =>
    setCollapsed((m) => ({ ...m, [id]: !m[id] }));
  const prepTime = isRestaurant ? details.estimated_time : "";
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast de errores de restricción de tienda */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
      <div className="p-4">
        <button
          className="px-3 py-2 rounded-lg border text-sm"
          onClick={() => router.back()}
        >
          Volver
        </button>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Column 1: Image */}
          <div className="flex justify-center items-center p-4 md:p-0">
            <div className="relative w-[212px] h-[286px] md:w-full md:h-full md:min-h-[600px]">
              {details.image_url ? (
                <Image
                  src={details.image_url}
                  alt={details.name}
                  fill
                  className="object-cover rounded-lg md:rounded-none"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg md:rounded-none" />
              )}
            </div>
          </div>

          {/* Column 2: Content */}
          <div className="flex flex-col p-4 pt-0 md:p-6">
            {/* Info Block */}
            <div className="order-1">
              <div className="space-y-2 py-4">
                <h1 className="font-bold text-lg md:text-xl text-black">
                  {details.name}
                </h1>
                <p className="font-semibold text-xl md:text-2xl text-black">
                  $ {unitPrice.toFixed(0)} USD /u
                </p>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-sm text-gray-400">
                    $ {unitPrice.toFixed(0)} USD /und (1 Und)
                  </span>
                  {details.previous_price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${details.previous_price.toFixed(0)} USD
                    </span>
                  )}
                  {details.discount_percentage && (
                    <span className="text-base font-bold text-[#04BD88]">
                      -{details.discount_percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description, Extras, and Note Block */}
            <div className="order-3 md:order-2">
              <hr className="my-5 border-gray-200 md:hidden" />
              {/* Mobile Description & Extras */}
              <div className="space-y-3 md:hidden">
                <h2 className="text-xl font-semibold">{details.name}</h2>
                {details.description && (
                  <p className="text-base text-black/90">
                    {details.description}
                  </p>
                )}
                {/* // <-- AÑADIDO: Lógica de extras y nota para móvil */}
                {isRestaurant && (
                  <ExtrasAndNoteSection
                    details={details}
                    selected={selected}
                    collapsed={collapsed}
                    toggleSection={toggleSection}
                    incOption={incOption}
                    decOption={decOption}
                    note={note}
                    setNote={setNote}
                  />
                )}
              </div>

              {/* Desktop Description, Extras & Note */}
              <div className="hidden md:block space-y-4">
                {isRestaurant && prepTime ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EEF6FF] text-[#1C398E] border border-[#BEDBFF]">
                    {prepTime}
                  </span>
                ) : null}
                {details.description ? (
                  <p className="text-sm text-gray-600">{details.description}</p>
                ) : null}
                {/* // <-- AÑADIDO: Lógica de extras y nota para escritorio */}
                {isRestaurant && (
                  <ExtrasAndNoteSection
                    details={details}
                    selected={selected}
                    collapsed={collapsed}
                    toggleSection={toggleSection}
                    incOption={incOption}
                    decOption={decOption}
                    note={note}
                    setNote={setNote}
                  />
                )}
              </div>
            </div>

            {/* Controls Block */}
            <div className="order-2 md:order-3 md:mt-auto md:pt-6">
              {/* Mobile Controls */}
              <div className="md:hidden mt-4 p-4 space-y-3 rounded-2xl bg-gray-100/70 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-base">Cantidad</span>
                  <div className="flex items-center gap-4 border rounded-full bg-white px-3 py-2 text-center">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="text-lg text-gray-500"
                    >
                      -
                    </button>
                    <span className="w-4 text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="text-lg text-gray-500"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="w-full text-center py-2.5 rounded-xl border border-[#202124] bg-white text-sm font-medium text-[#202124]"
                  disabled={!requiredSatisfied}
                  onClick={() => addToCartHandler(false)}
                >
                  Añadir y seguir explorando
                </button>
                <button
                  className="w-full flex justify-between items-center px-4 py-2.5 rounded-xl bg-[#04BD88] text-white text-sm font-medium"
                  disabled={!requiredSatisfied}
                  onClick={() => addToCartHandler(true)}
                >
                  <span>Agregar</span>
                  <span>Subtotal: {subtotal.toFixed(2)} USD</span>
                </button>
              </div>

              {/* Desktop Controls */}
              <div className="hidden md:flex items-center justify-between gap-3 border-t pt-6">
                <div className="flex items-center gap-2 border rounded-full px-3 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-lg"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-lg"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-3 ml-auto">
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
        </div>
      </div>
    </div>
  );
}
