"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { saveMenuOrderAction, type MenuEditorInitialData } from "./actions";

type SaveState = "idle" | "saving" | "saved" | "error";

type SnapshotState = {
  subCategories: MenuEditorInitialData["subCategories"];
  products: MenuEditorInitialData["products"];
};

function DragHandle() {
  return (
    <span
      aria-hidden="true"
      className="grid h-7 w-7 place-items-center rounded-full bg-[#EEF2F7] text-[#667085]"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <circle cx="9" cy="6" r="1.3" />
        <circle cx="15" cy="6" r="1.3" />
        <circle cx="9" cy="12" r="1.3" />
        <circle cx="15" cy="12" r="1.3" />
        <circle cx="9" cy="18" r="1.3" />
        <circle cx="15" cy="18" r="1.3" />
      </svg>
    </span>
  );
}

function SortableCategoryCard({
  id,
  index,
  name,
  imageUrl,
  isOpen,
  productCount,
  onToggle,
}: {
  id: string;
  index: number;
  name: string;
  imageUrl: string | null;
  isOpen: boolean;
  productCount: number;
  onToggle: () => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-2xl border border-[#E4E8EF] bg-white shadow-[0_2px_8px_rgba(19,31,52,0.06)]",
        isDragging && "opacity-65",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing"
          aria-label={`Arrastrar categoría ${name}`}
          {...attributes}
          {...listeners}
        >
          <DragHandle />
        </button>

        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F7F9FC]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[11px] text-[#8A93A3]">CAT</span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between text-left"
        >
          <div>
            <p className="text-sm font-semibold text-[#171717]">
              {index + 1}. {name}
            </p>
            <p className="text-xs text-[#6B7280]">{productCount} producto(s)</p>
          </div>
          <span className="text-xl text-[#8A93A3]">{isOpen ? "-" : "+"}</span>
        </button>
      </div>
    </article>
  );
}

function SortableProductRow({
  id,
  name,
  imageUrl,
  order,
  price,
  isAvailable,
}: {
  id: string;
  name: string;
  imageUrl: string | null;
  order: number;
  price: number;
  isAvailable: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "flex items-center gap-3 rounded-xl border border-[#E5E8EF] bg-[#FBFCFF] p-2",
        isDragging && "opacity-65",
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing"
        aria-label={`Arrastrar producto ${name}`}
        {...attributes}
        {...listeners}
      >
        <DragHandle />
      </button>

      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-[#8A93A3]">IMG</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#171717]">
          {order}. {name}
        </p>
        <p className="text-xs text-[#6B7280]">
          DOP {price.toFixed(2)} ·{" "}
          {isAvailable ? "Disponible" : "No disponible"}
        </p>
      </div>
    </div>
  );
}

export default function MenuEditorClient({
  initialData,
}: {
  initialData: MenuEditorInitialData;
}) {
  const [subCategories, setSubCategories] = useState(initialData.subCategories);
  const [products, setProducts] = useState(initialData.products);
  const [openCategoryId, setOpenCategoryId] = useState(
    initialData.subCategories[0]?.id ?? "",
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [snapshot, setSnapshot] = useState<SnapshotState>({
    subCategories: initialData.subCategories,
    products: initialData.products,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const productsBySubCategory = useMemo(() => {
    const map = new Map<string, MenuEditorInitialData["products"]>();

    for (const category of subCategories) {
      map.set(category.id, []);
    }

    for (const product of products) {
      if (!product.subCategoryId) continue;
      if (!map.has(product.subCategoryId)) continue;
      map.get(product.subCategoryId)?.push(product);
    }

    for (const [subCategoryId, list] of map.entries()) {
      const sorted = [...list].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
      );
      map.set(subCategoryId, sorted);
    }

    return map;
  }, [products, subCategories]);

  const hasCategories = subCategories.length > 0;

  function markDirty() {
    if (saveState !== "saving") {
      setSaveState("idle");
    }
    setErrorMessage("");
  }

  function handleSubCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = subCategories.findIndex((item) => item.id === active.id);
    const newIndex = subCategories.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(subCategories, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        displayOrder: index + 1,
      }),
    );

    setSubCategories(next);
    markDirty();
  }

  function handleProductDragEnd(subCategoryId: string, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const scoped = productsBySubCategory.get(subCategoryId) ?? [];
    const oldIndex = scoped.findIndex((item) => item.id === active.id);
    const newIndex = scoped.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reorderedScoped = arrayMove(scoped, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        displayOrder: index + 1,
      }),
    );

    const reorderedMap = new Map(
      reorderedScoped.map((item) => [item.id, item]),
    );
    const nextProducts = products.map(
      (item) => reorderedMap.get(item.id) ?? item,
    );

    setProducts(nextProducts);
    markDirty();
  }

  async function handleSaveOrder() {
    setSaveState("saving");
    setErrorMessage("");

    const payload = {
      subCategoryOrder: subCategories.map((item) => item.id),
      productOrdersBySubCategory: Object.fromEntries(
        subCategories.map((subCategory) => [
          subCategory.id,
          (productsBySubCategory.get(subCategory.id) ?? []).map(
            (product) => product.id,
          ),
        ]),
      ),
    };

    const result = await saveMenuOrderAction(payload);

    if (!result.ok) {
      setSaveState("error");
      setErrorMessage(result.message || "No se pudo guardar el orden");
      setSubCategories(snapshot.subCategories);
      setProducts(snapshot.products);
      return;
    }

    setSnapshot({
      subCategories,
      products,
    });
    setSaveState("saved");

    setTimeout(() => {
      setSaveState("idle");
    }, 1600);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(320px,430px)]">
      <section className="rounded-2xl border border-[#E6EAF1] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#171717]">
          Control de orden
        </h2>
        <p className="mt-1 text-sm text-[#5D6472]">
          Arrastra categorías y productos. Luego pulsa guardar para persistir en
          Supabase.
        </p>

        <button
          type="button"
          onClick={handleSaveOrder}
          disabled={!hasCategories || saveState === "saving"}
          className="mt-5 rounded-xl bg-[#04BD88] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveState === "saving" ? "Guardando..." : "Guardar orden"}
        </button>

        <div className="mt-3 min-h-5 text-sm">
          {saveState === "saved" && (
            <span className="text-[#067647]">
              Orden guardado correctamente.
            </span>
          )}
          {saveState === "error" && (
            <span className="text-[#B42318]">{errorMessage}</span>
          )}
          {saveState === "idle" && (
            <span className="text-[#667085]">
              Tienes cambios locales hasta que guardes.
            </span>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[430px] rounded-[30px] border border-[#D9DCE3] bg-white p-3 shadow-[0_14px_40px_rgba(16,24,40,0.12)]">
        <div className="mx-auto mb-3 h-1.5 w-24 rounded-full bg-[#E9EDF3]" />
        <div className="rounded-[24px] bg-[#F7F9FC] p-3">
          <header className="mb-3 rounded-2xl bg-black px-4 py-3 text-white">
            <p className="text-xs uppercase tracking-[0.08em] text-[#A2A8B8]">
              Preview móvil
            </p>
            <p className="truncate text-base font-semibold">
              {initialData.partner.name}
            </p>
          </header>

          {!hasCategories ? (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-6 text-center text-sm text-[#64748B]">
              No hay subcategorías disponibles para ordenar.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSubCategoryDragEnd}
            >
              <SortableContext
                items={subCategories.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {subCategories.map((subCategory, index) => {
                    const scopedProducts =
                      productsBySubCategory.get(subCategory.id) ?? [];
                    const isOpen = openCategoryId === subCategory.id;

                    return (
                      <div key={subCategory.id}>
                        <SortableCategoryCard
                          id={subCategory.id}
                          index={index}
                          name={subCategory.name}
                          imageUrl={subCategory.imageUrl}
                          isOpen={isOpen}
                          productCount={scopedProducts.length}
                          onToggle={() =>
                            setOpenCategoryId((prev) =>
                              prev === subCategory.id ? "" : subCategory.id,
                            )
                          }
                        />

                        {isOpen ? (
                          <div className="mt-2 rounded-2xl border border-[#E4E8EF] bg-white p-2">
                            {scopedProducts.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-[#D3DBE8] p-4 text-center text-xs text-[#6B7280]">
                                Esta subcategoría no tiene productos.
                              </div>
                            ) : (
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(event) =>
                                  handleProductDragEnd(subCategory.id, event)
                                }
                              >
                                <SortableContext
                                  items={scopedProducts.map((item) => item.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="space-y-2">
                                    {scopedProducts.map((product) => (
                                      <SortableProductRow
                                        key={product.id}
                                        id={product.id}
                                        name={product.name}
                                        imageUrl={product.imageUrl}
                                        order={product.displayOrder}
                                        price={product.displayPrice}
                                        isAvailable={product.isAvailable}
                                      />
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </section>
    </div>
  );
}
