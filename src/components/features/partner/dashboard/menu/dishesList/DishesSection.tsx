"use client";

import Spinner from "@/src/components/basics/Spinner";
import { useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect } from "react"; // Importa useEffect
import DishItem from "./DishItem";
import { DishData } from "@/src/lib/partner/dashboard/type";
import SearchInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import TagsTabs from "@/src/components/features/partner/TagsTabs";
import SearchPartnerIcon from "@/src/components/icons/SearchPartnerIcon";
import { deleteDishAction, restoreDishAction } from "../newDish/actions";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import Toast from "@/src/components/basics/Toast";
import { X } from "lucide-react";
import DishImportModal from "./DishImportModal";
import BasicModal from "@/src/components/basics/BasicModal";

type DishesListProps = {
  dishes: DishData[];
  categories: { value: string; label: string }[];
  tags: { value: string; label: string; imageUrl?: string | null }[];
};

export default function DishesSection({
  dishes,
  categories,
  tags,
}: DishesListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Los estados locales que controlan los inputs
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [items, setItems] = useState(dishes);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeletingIds, setBulkDeletingIds] = useState<string[]>([]);
  const [confirmMode, setConfirmMode] = useState<"single" | "bulk">("single");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [optimisticModal, setOptimisticModal] = useState<
    "create" | "edit" | null
  >(null);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type?: "success" | "error" | "info";
  }>({ open: false, msg: "" });

  // Sincroniza el estado local con los datos que vienen del servidor
  useEffect(() => {
    setItems(dishes);
  }, [dishes]);

  useEffect(() => {
    if (searchParams.get("edit") || searchParams.get("create") === "true") {
      setOptimisticModal(null);
    }
  }, [searchParams]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => dishes.some((d) => d.id === id)),
    );
  }, [dishes]);

  useEffect(() => {
    // Usamos un timeout para "debounce" la búsqueda y no actualizar la URL en cada tecleo.
    const debounceTimer = setTimeout(() => {
      // Creamos una copia de los parámetros de búsqueda actuales
      const params = new URLSearchParams(searchParams.toString());

      // Actualizamos el parámetro 'q' (búsqueda de texto)
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q"); // Si el input está vacío, eliminamos el parámetro de la URL
      }

      // Actualizamos el parámetro 'category'
      if (selectedCategory) {
        params.set("category", selectedCategory);
      } else {
        params.delete("category");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCategory]);

  // Estado y manejador para la etiqueta seleccionada
  const handleDeleteDish = async (id: string) => {
    if (!id) return;
    setConfirmMode("single");
    setBulkDeletingIds([]);
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleRestoreDish = async (id: string) => {
    if (!id) return;
    try {
      await restoreDishAction(id);
      setToast({ open: true, msg: "Plato habilitado", type: "success" });
      startTransition(() => router.refresh());
    } catch (e) {
      console.error("Error habilitando plato:", e);
      setToast({
        open: true,
        msg: "No se pudo habilitar el plato",
        type: "error",
      });
    }
  };

  const onConfirmDelete = async () => {
    setConfirmOpen(false);

    if (confirmMode === "bulk") {
      if (bulkDeletingIds.length === 0) return;

      try {
        await Promise.all(bulkDeletingIds.map((id) => deleteDishAction(id)));
        setToast({
          open: true,
          msg: "Platillos eliminados correctamente",
          type: "success",
        });
        setSelectedIds((prev) =>
          prev.filter((id) => !bulkDeletingIds.includes(id)),
        );
        startTransition(() => router.refresh());
      } catch (e) {
        console.error("Error eliminando en lote:", e);
        setToast({
          open: true,
          msg: "No se pudo eliminar en lote",
          type: "error",
        });
      } finally {
        setBulkDeletingIds([]);
        setDeletingId(null);
      }

      return;
    }

    if (!deletingId) return;
    const id = deletingId;

    const prev = items;
    setItems((curr) => curr.filter((d) => d.id !== id));

    try {
      await deleteDishAction(id);
      setToast({ open: true, msg: "Plato eliminado", type: "success" });
      startTransition(() => router.refresh());
    } catch (e) {
      console.error("Error eliminando plato:", e);
      setItems(prev);
      setToast({
        open: true,
        msg: "No se pudo eliminar el plato",
        type: "error",
      });
    } finally {
      setDeletingId(null);
      setBulkDeletingIds([]);
    }
  };

  const openCreateModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("create", "true");
    params.delete("edit");
    setOptimisticModal("create");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const openEditModal = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("edit", id);
    params.delete("create");
    setOptimisticModal("edit");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const selectedCount = selectedIds.length;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAllVisible = () => {
    setSelectedIds(items.map((dish) => dish.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const runBulkUpdate = async (mode: "activate" | "deactivate") => {
    if (selectedIds.length === 0) return;

    try {
      if (mode === "activate") {
        await Promise.all(selectedIds.map((id) => restoreDishAction(id)));
      } else {
        await Promise.all(selectedIds.map((id) => deleteDishAction(id)));
      }

      setToast({
        open: true,
        msg:
          mode === "activate"
            ? "Platillos activados correctamente"
            : "Platillos desactivados correctamente",
        type: "success",
      });
      clearSelection();
      startTransition(() => router.refresh());
    } catch (e) {
      console.error("Error en acción masiva:", e);
      setToast({
        open: true,
        msg: "No se pudo completar la acción masiva",
        type: "error",
      });
    }
  };

  const requestBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmMode("bulk");
    setDeletingId(null);
    setBulkDeletingIds([...selectedIds]);
    setConfirmOpen(true);
  };

  return (
    <>
      <div className="space-y-6 rounded-xl bg-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-[#1F2937]">
              Lista de platillos
            </h2>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {selectedCount} seleccionados
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DishImportModal />
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Añadir Nuevo Menú / Plato
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-primary bg-[#F3F4F6] px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-medium text-black">
              Acciones en lote:
            </span>
            <button
              type="button"
              disabled={selectedCount === 0 || isPending}
              onClick={() => runBulkUpdate("activate")}
              className="rounded-[10px] border border-primary bg-white px-4 py-2 text-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Activar
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || isPending}
              onClick={() => runBulkUpdate("deactivate")}
              className="rounded-[10px] border border-[#6B7280] bg-white px-4 py-2 text-sm font-medium text-[#6B7280] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Desactivar
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || isPending}
              onClick={requestBulkDelete}
              className="rounded-[10px] border border-[#EF4444] bg-white px-4 py-2 text-sm font-medium text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Eliminar
            </button>
            <button
              type="button"
              onClick={selectAllVisible}
              disabled={items.length === 0 || isPending}
              className="rounded-[10px] border border-[#D1D5DC] bg-white px-4 py-2 text-sm font-medium text-[#101828] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Seleccionar todo
            </button>
          </div>

          <button
            type="button"
            onClick={clearSelection}
            aria-label="Limpiar selección"
            className="rounded p-1 text-[#6B7280] hover:bg-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SearchInput
            id="search"
            label="Menú / platos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="md:col-span-2"
            icon={<SearchPartnerIcon />}
            disabled={isPending}
          />
          <SelectInput
            id="category"
            label="Categoría"
            options={categories}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isPending}
          />
          <SelectInput
            id="availability"
            label="Disponibilidad"
            options={[
              { value: "true", label: "Disponible" },
              { value: "false", label: "No disponible" },
              { value: "all", label: "Todos" },
            ]}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => option.label}
            value={searchParams.get("available") || "true"}
            onChange={(e) => {
              const val = e.target.value;
              const params = new URLSearchParams(searchParams.toString());
              if (val === "true") {
                params.delete("available");
              } else {
                params.set("available", val);
              }
              startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
              });
            }}
            disabled={isPending}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-start gap-6">
          <TagsTabs
            tags={tags}
            selectedCategoryId={selectedCategory}
            onSelectCategory={isPending ? () => {} : setSelectedCategory}
            disabled={isPending}
          />
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center h-72">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-72">
          <p className="text-gray-500">
            No se encontraron platillos, verifique los filtros.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {items.map((dish) => (
            <DishItem
              key={dish.id}
              dish={dish}
              onDelete={handleDeleteDish}
              onRestore={handleRestoreDish}
              onEdit={openEditModal}
              isSelected={selectedIds.includes(dish.id)}
              onToggleSelect={toggleSelection}
            />
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmOpen}
        title={
          confirmMode === "bulk"
            ? `Eliminar ${bulkDeletingIds.length} platillos`
            : "Eliminar plato"
        }
        description={
          confirmMode === "bulk"
            ? "Los platillos seleccionados pasarán a estar no disponibles. ¿Deseas continuar?"
            : "Esta acción no se puede deshacer. ¿Deseas continuar?"
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={onConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingId(null);
          setBulkDeletingIds([]);
          setConfirmMode("single");
        }}
      />

      {/* Toast notifications */}
      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <BasicModal
        open={optimisticModal !== null}
        onClose={() => setOptimisticModal(null)}
        title={
          optimisticModal === "create"
            ? "Abriendo formulario..."
            : "Abriendo editor..."
        }
        className="max-w-lg"
      >
        <div className="flex min-h-[220px] items-center justify-center">
          <Spinner />
        </div>
      </BasicModal>
    </>
  );
}
