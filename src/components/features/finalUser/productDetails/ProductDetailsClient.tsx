"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import type { ProductDetails } from "@/src/lib/finalUser/stores/getProductDetails";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { addItem, selectCartPartnerId } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";
import { useRouter } from "next/navigation";
import Toast from "@/src/components/basics/Toast";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

// Componente para renderizar la sección de extras y la nota.
// Lo creamos para no repetir el mismo bloque de código en móvil y escritorio.
const VariantsSection = ({
  groups,
  selectedVariants,
  onSelect,
  getOptionPrice,
}: {
  groups: ProductDetails["variant_groups"];
  selectedVariants: Record<string, string>;
  onSelect: (groupId: string, variantId: string) => void;
  getOptionPrice: (price: number) => number;
}) => {
  if (!groups || groups.length === 0) return null;
  return (
    <div className="space-y-6 mt-4 mb-6 border-b pb-6 border-gray-100">
      {groups.map((g) => (
        <div key={g.id} className="flex flex-col">
          <div className="bg-[#EFF2F5] rounded-[10px] px-[10px] py-[10px] flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-black">{g.name}</span>
            <div className="flex items-center gap-2">
              {g.is_required && (
                <span className="text-[13px] text-[#28B996] font-semibold">
                  Requerido
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            {g.variants.map((v) => {
              const isSelected = selectedVariants[g.id] === v.id;
              const price = getOptionPrice(
                v.display_variant_price ?? v.base_price,
              );
              return (
                <label
                  key={v.id}
                  className="flex items-center justify-between py-3 px-2 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? "border-[#04BD88]" : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#04BD88]" />
                      )}
                    </div>
                    <span className="text-[16px] font-medium text-black">
                      {v.name}
                    </span>
                  </div>
                  {price !== 0 && (
                    <span className="text-xs font-semibold text-[#6A6C71]">
                      {price > 0 ? "+" : ""}
                      RD$ {Math.abs(price).toFixed(2)}
                    </span>
                  )}
                  <input
                    type="radio"
                    name={g.id}
                    value={v.id}
                    checked={isSelected}
                    onChange={() => onSelect(g.id, v.id)}
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const ExtrasAndNoteSection = ({
  details,
  selected,
  collapsed,
  toggleSection,
  incOption,
  decOption,
  note,
  setNote,
  getOptionPrice,
}: {
  details: ProductDetails;
  selected: Record<string, number>;
  collapsed: Record<string, boolean>;
  toggleSection: (id: string) => void;
  incOption: (extraId: string) => void;
  decOption: (extraId: string) => void;
  note: string;
  setNote: (note: string) => void;
  getOptionPrice: (price: number) => number;
}) => (
  <div className="space-y-6 mt-4">
    {details.sections.length === 0 ? (
      <div className="text-sm text-gray-500">
        Este producto no tiene extras disponibles.
      </div>
    ) : (
      details.sections.map((s) => {
        const isCollapsed = collapsed[s.id];
        return (
          <div key={s.id} className="flex flex-col">
            <div className="bg-[#EFF2F5] rounded-[10px] px-[10px] py-[10px] flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-black">{s.name}</span>
              <div className="flex items-center gap-2">
                {s.isRequired && (
                  <span className="text-[13px] text-[#28B996] font-semibold">
                    Requerido
                  </span>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                {s.options.map((o) => {
                  const qty = selected[o.extraId] || 0;
                  const finalPrice = getOptionPrice(o.price);
                  return (
                    <div
                      key={o.id}
                      className="flex items-center justify-between py-3 px-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[18px] sm:text-[20px] font-semibold text-black leading-tight">
                          {o.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {finalPrice > 0 && (
                          <span className="text-xs font-semibold text-[#6A6C71]">
                            + RD$ {finalPrice.toFixed(2)}
                          </span>
                        )}

                        <div className="flex items-center gap-3">
                          {qty > 0 ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => decOption(o.extraId)}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-[#04BD88] text-white"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                              <span className="font-semibold text-sm w-4 text-center">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => incOption(o.extraId)}
                                className="w-5 h-5 flex items-center justify-center rounded-full bg-[#04BD88] text-white"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => incOption(o.extraId)}
                              className="w-5 h-5 rounded-full border-[1.5px] border-[#D9DCE3]"
                            ></button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })
    )}

    <div className="mt-6">
      <label className="block text-sm font-bold text-black mb-2">
        Nota para el pedido (opcional)
      </label>
      <div className="relative">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej. Sin cebolla, salsa aparte…"
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-[#04BD88] bg-gray-50/50 resize-none"
        />
      </div>
    </div>
  </div>
);

export default function ProductDetailsClient({
  details,
  partnerType,
}: {
  details: ProductDetails;
  partnerType?: string;
}) {
  const showProductDetails = useFloatingButtonStore(
    (state) => state.showProductDetails,
  );
  const isRestaurant = partnerType === "restaurant";
  const dispatch = useAppDispatch();
  const currentPartnerId = useAppSelector(selectCartPartnerId);
  const router = useRouter();
  // Inicializar con min_quantity o 1
  const minQty = details.min_quantity || 1;
  const qtyStep = details.quantity_step || 1;
  const [quantity, setQuantity] = useState(minQty);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    // Pre-select required variant groups (first option) to help user?
    // Disabled for now to force user choice
  }, []);

  useEffect(() => {
    const state = useFloatingButtonStore.getState();
    const prev = {
      mode: state.mode,
      text: state.text,
      secondaryText: state.secondaryText,
      action: state.action,
    };

    return () => {
      // Restore previous state on unmount
      const store = useFloatingButtonStore.getState();
      if (prev.mode === "store") {
        store.showStore(prev.text, prev.secondaryText, prev.action);
      } else if (prev.mode === "search") {
        store.showSearch();
      } else if (prev.mode === "cart") {
        store.showCartButton(prev.text, prev.action);
      } else {
        // Fallback or hide
        if (prev.mode !== "product-details") {
          if (prev.mode === "hidden") store.hideButton();
          // If loading or other modes, maybe just leave it or hide
        }
      }
    };
  }, []);

  const discountDecimal = useMemo(() => {
    const d = details.discount_percentage
      ? Number(details.discount_percentage)
      : 0;
    return d ? d / 100 : 0;
  }, [details.discount_percentage]);

  const unitPrice = useMemo(() => {
    const base = Number(details.display_price) || 0;
    return discountDecimal > 0 ? base * (1 - discountDecimal) : base;
  }, [details.display_price, discountDecimal]);

  const getOptionPrice = (price: number) => {
    return discountDecimal > 0 ? price * (1 - discountDecimal) : price;
  };

  const variantsTotalPerUnit = useMemo(() => {
    if (!details.variant_groups) return 0;
    let total = 0;
    for (const g of details.variant_groups) {
      const vId = selectedVariants[g.id];
      if (vId) {
        const v = g.variants.find((x) => x.id === vId);
        if (v) {
          total += getOptionPrice(v.display_variant_price ?? v.base_price ?? 0);
        }
      }
    }
    return total;
  }, [details.variant_groups, selectedVariants, discountDecimal]);

  const extrasPerUnitTotal = useMemo(() => {
    if (!isRestaurant) return 0;
    let total = 0;
    for (const s of details.sections) {
      for (const o of s.options) {
        const qty = selected[o.extraId] || 0;
        if (qty > 0) total += getOptionPrice(o.price) * qty;
      }
    }
    return total;
  }, [details.sections, selected, isRestaurant, discountDecimal]);

  // Logic: If any variant is selected, the variants define the base price (substituting the original product price).
  // If no variants are selected, we fallback to the product's unitPrice.
  const effectiveBasePrice = useMemo(() => {
    const hasVariantsSelected = Object.keys(selectedVariants).length > 0;
    return hasVariantsSelected ? variantsTotalPerUnit : unitPrice;
  }, [selectedVariants, variantsTotalPerUnit, unitPrice]);

  const subtotal = useMemo(
    () => (effectiveBasePrice + extrasPerUnitTotal) * quantity,
    [effectiveBasePrice, extrasPerUnitTotal, quantity],
  );

  const requiredSatisfied = useMemo(() => {
    // Check variant groups
    const variantsOk = (details.variant_groups || []).every((g) => {
      if (!g.is_required) return true;
      return !!selectedVariants[g.id];
    });

    if (!isRestaurant) return variantsOk;

    const sectionsOk = details.sections.every((s) => {
      if (!s.isRequired) return true;
      return s.options.some((o) => (selected[o.extraId] || 0) > 0);
    });

    return variantsOk && sectionsOk;
  }, [
    details.sections,
    details.variant_groups,
    selected,
    selectedVariants,
    isRestaurant,
  ]);

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

    const variants = (details.variant_groups || [])
      .filter((g) => selectedVariants[g.id])
      .map((g) => {
        const v = g.variants.find((x) => x.id === selectedVariants[g.id]);
        return v
          ? {
              variantId: v.id,
              groupName: g.name,
              name: v.name,
              // We set price 0 because it's absorbed into unitPrice
              price: 0,
            }
          : null;
      })
      .filter(Boolean) as any[];

    const extras = !isRestaurant
      ? []
      : details.sections.flatMap((s) =>
          s.options
            .filter((o) => (selected[o.extraId] || 0) > 0)
            .map((o) => ({
              id: "",
              extraId: o.extraId,
              name: o.name,
              price: getOptionPrice(o.price),
              quantity: selected[o.extraId],
              imageUrl: o.imageUrl,
            })),
        );
    dispatch(
      addItem({
        productId: details.id,
        partnerId: details.partnerId,
        name: details.name,
        imageUrl: details.image_url,
        // Use effectiveBasePrice here
        unitPrice: Number(effectiveBasePrice.toFixed(2)),
        quantity,
        measurementUnit:
          details.measurement_unit !== "unit"
            ? details.measurement_unit
            : undefined,
        quantityStep: qtyStep,
        minQuantity: minQty,
        extras,
        variants,
        mergeByProduct: true,
        note: note.trim() ? note.trim() : null,
      }),
    );
    if (openAfter) {
      dispatch(openCart());
    } else {
      setToast({
        open: true,
        message: "Producto agregado correctamente",
        type: "success",
      });
    }
  };

  useEffect(() => {
    showProductDetails({
      quantity,
      quantityUnit: details.measurement_unit,
      onIncrement: () =>
        setQuantity((q) => {
          const next = q + qtyStep;
          return Math.round(next * 100) / 100;
        }),
      onDecrement: () =>
        setQuantity((q) => {
          const next = q - qtyStep;
          return next < minQty ? minQty : Math.round(next * 100) / 100;
        }),
      action: () => {
        if (requiredSatisfied) {
          addToCartHandler(false);
        } else {
          setToast({
            open: true,
            message: "Por favor selecciona todas las opciones requeridas.",
            type: "error",
          });
        }
      },
      disabled: !requiredSatisfied,
      secondaryText: `RD$ ${subtotal.toFixed(2)}`,
    });
  }, [
    showProductDetails,
    quantity,
    details.measurement_unit,
    qtyStep,
    minQty,
    subtotal,
    requiredSatisfied,
    addToCartHandler,
  ]);

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
    <div className="max-w-6xl mx-auto pb-24 md:pb-0 font-sans">
      {/* Toast de errores de restricción de tienda */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      {/* Desktop Back Button */}
      <div className="p-4 hidden md:block">
        <button
          className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
          onClick={() => router.back()}
        >
          Volver
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white md:rounded-2xl md:border md:overflow-hidden min-h-screen md:min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Mobile Header / Image Section */}
          <div className="relative md:hidden">
            {/* Back Button Overlay */}
            {/* Image */}
            <div className="w-full aspect-[4/3] relative">
              {details.image_url ? (
                <Image
                  src={details.image_url}
                  alt={details.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Image */}
          <div className="hidden md:flex justify-center items-center p-0 bg-gray-50 border-r">
            <div className="relative w-full h-[500px]">
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
          </div>

          {/* Content Section */}
          <div className="flex flex-col p-5 md:p-8">
            {/* Header Info */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-black leading-tight">
                  {details.name}
                </h1>
              </div>

              {/* Rating Row */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-[#6A6C71]">
                    4.8
                  </span>
                  <svg
                    className="w-3 h-3 text-[#6A6C71] fill-current"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#606060]">
                  (143)
                </span>
              </div>

              {/* Price & Description */}
              <p className="text-sm text-[#6A6C71] leading-relaxed mb-4">
                {details.description || "Sin descripción disponible."}
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-black">
                  RD$ {(effectiveBasePrice + extrasPerUnitTotal).toFixed(2)}
                </span>
                {details.discount_percentage && (
                  <span className="bg-[#04BD88]/10 text-[#04BD88] text-xs font-bold px-2 py-1 rounded-full">
                    -{details.discount_percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Extras Section */}
            <div className="flex-1">
              <VariantsSection
                groups={details.variant_groups}
                selectedVariants={selectedVariants}
                onSelect={(gId, vId) =>
                  setSelectedVariants((prev) => ({ ...prev, [gId]: vId }))
                }
                getOptionPrice={getOptionPrice}
              />
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
                  getOptionPrice={getOptionPrice}
                />
              )}
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:block mt-8">
              <div className="flex flex-col gap-4">
                {/* Quantity & Add Row */}
                <div className="flex items-center gap-4">
                  {/* Quantity Selector Figma Style */}
                  <div className="flex items-center justify-between bg-white shadow-[0_2px_15px_rgba(0,0,0,0.08)] rounded-full px-4 py-2 h-[44px] w-[130px] flex-shrink-0">
                    <button
                      onClick={() =>
                        setQuantity((q) => {
                          const next = q - qtyStep;
                          return next < minQty
                            ? minQty
                            : Math.round(next * 100) / 100;
                        })
                      }
                      className="text-[#04BD88] text-xl font-medium w-8 flex justify-center"
                    >
                      -
                    </button>
                    <span className="text-black font-semibold text-sm">
                      {quantity}{" "}
                      {details.measurement_unit &&
                      details.measurement_unit !== "unit"
                        ? details.measurement_unit
                        : ""}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => {
                          const next = q + qtyStep;
                          return Math.round(next * 100) / 100;
                        })
                      }
                      className="text-[#04BD88] text-xl font-medium w-8 flex justify-center"
                    >
                      +
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    className="flex-1 bg-[#04BD88] text-white h-[44px] rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#04BD88]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!requiredSatisfied}
                    onClick={() => addToCartHandler(false)}
                  >
                    <span>Agregar</span>
                    <span className="font-normal opacity-90">
                      RD$ {subtotal.toFixed(2)}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
