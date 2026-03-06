"use client";

import React, { useState, useEffect, useTransition } from "react";
import ProductItem from "./ProductItem";
import { ProductData } from "@/src/lib/partner/dashboard/type";
import ProductImportModal from "../ProductImportModal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Spinner from "@/src/components/basics/Spinner";
import {
  deleteProductAction,
  restoreProductAction,
} from "@/src/app/partner/(session)/market/productos/actions";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import Toast from "@/src/components/basics/Toast";
import { Search, X } from "lucide-react";
import {
  ProductSubCategory,
  ProductTagDefinition,
} from "@/src/lib/partner/productTypes";
import CreateProductModal from "./CreateProductModal";

type ProductsListProps = {
  products: ProductData[];
  categories: { value: string; label: string }[];
  initialSubCategories: ProductSubCategory[];
  availableTags: ProductTagDefinition[];
};

export default function ProductsSection({
  products,
  categories,
  initialSubCategories,
  availableTags,
}: ProductsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estados locales para los inputs
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );

  // Estados para eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Estado para Toast
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type?: "success" | "error" | "info";
  }>({ open: false, msg: "" });

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => products.some((p) => p.id === id)),
    );
  }, [products]);

  // Sincronizar búsqueda y filtros con URL
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }

      if (selectedCategory) {
        params.set("category", selectedCategory);
      } else {
        params.delete("category");
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  const handleDeleteProduct = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleRestoreProduct = async (id: string) => {
    try {
      await restoreProductAction(id);
      setToast({
        open: true,
        msg: "Producto habilitado correctamente",
        type: "success",
      });
      startTransition(() => router.refresh());
    } catch (e) {
      console.error("Error habilitando producto:", e);
      setToast({
        open: true,
        msg: "Error al habilitar el producto",
        type: "error",
      });
    }
  };

  const onConfirmDelete = async () => {
    if (!deletingId) return;
    const id = deletingId;
    setConfirmOpen(false);

    try {
      await deleteProductAction(id);
      setToast({
        open: true,
        msg: "Producto inhabilitado correctamente",
        type: "success",
      });
      // La revalidación ya ocurre en el server action, pero refresh ayuda a actualizar la UI cliente
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Error eliminando producto:", error);
      setToast({
        open: true,
        msg: "Error al eliminar el producto",
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Manejador de cambio de disponibilidad
  const handleAvailabilityChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "true") {
      params.delete("available"); // Default
    } else {
      params.set("available", val);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const selectedCount = selectedIds.length;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectAllVisible = () => {
    setSelectedIds(products.map((product) => product.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const runBulkUpdate = async (mode: "activate" | "deactivate") => {
    if (selectedIds.length === 0) return;

    try {
      if (mode === "activate") {
        await Promise.all(selectedIds.map((id) => restoreProductAction(id)));
      } else {
        await Promise.all(selectedIds.map((id) => deleteProductAction(id)));
      }

      setToast({
        open: true,
        msg:
          mode === "activate"
            ? "Productos activados correctamente"
            : "Productos desactivados correctamente",
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

  const runBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      await Promise.all(selectedIds.map((id) => deleteProductAction(id)));
      setToast({
        open: true,
        msg: "Productos eliminados correctamente",
        type: "success",
      });
      clearSelection();
      startTransition(() => router.refresh());
    } catch (e) {
      console.error("Error eliminando en lote:", e);
      setToast({
        open: true,
        msg: "No se pudo eliminar en lote",
        type: "error",
      });
    }
  };

  const openEditModal = (productId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("edit", productId);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <>
      <div className="space-y-6 rounded-xl bg-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-[#1F2937]">
              Lista de productos
            </h2>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {selectedCount} seleccionados
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ProductImportModal />
            <CreateProductModal
              initialSubCategories={initialSubCategories}
              availableTags={availableTags}
            />
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
              disabled={selectedCount === 0}
              onClick={() =>
                setToast({
                  open: true,
                  msg: "La acción de categoría estará disponible próximamente",
                  type: "info",
                })
              }
              className="rounded-[10px] border border-[#3B82F6] bg-white px-4 py-2 text-sm font-medium text-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cambiar Categoría
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || isPending}
              onClick={runBulkDelete}
              className="rounded-[10px] border border-[#EF4444] bg-white px-4 py-2 text-sm font-medium text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Eliminar
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

        <div className="space-y-4">
          <div>
            <label
              htmlFor="search"
              className="mb-1 block text-sm font-medium text-black"
            >
              Producto
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9BA1AE]" />
              <input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isPending}
                placeholder="Buscar por palabras claves"
                className="h-[46px] w-full rounded-xl border border-[#D9DCE3] bg-white pl-12 pr-4 text-sm text-black outline-none placeholder:text-[#9BA1AE] focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-black"
              >
                Todas las categorías
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isPending}
                className="h-[46px] w-full rounded-xl border border-[#D9DCE3] bg-white px-4 text-sm text-black outline-none focus:border-primary"
              >
                <option value="">Todas</option>
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="availability"
                className="mb-1 block text-sm font-medium text-black"
              >
                Disponibilidad
              </label>
              <select
                id="availability"
                value={searchParams.get("available") || "true"}
                onChange={(e) => handleAvailabilityChange(e.target.value)}
                disabled={isPending}
                className="h-[46px] w-full rounded-xl border border-[#D9DCE3] bg-white px-4 text-sm text-black outline-none focus:border-primary"
              >
                <option value="true">Disponible</option>
                <option value="false">No disponible</option>
                <option value="all">Todos</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={selectAllVisible}
            disabled={products.length === 0}
            className="rounded-xl border-2 border-[#D9DCE3] px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            Seleccionar todo
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center justify-center h-72">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center h-72">
          <p className="text-gray-500">
            No se encontraron productos, verifique los filtros.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct}
              onRestore={handleRestoreProduct}
              onEdit={openEditModal}
              isSelected={selectedIds.includes(product.id)}
              onToggleSelect={toggleSelection}
            />
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Eliminar producto"
        description="El producto pasará a estar 'No disponible'. ¿Deseas continuar?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={onConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingId(null);
        }}
      />

      {/* Toast notifications */}
      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </>
  );
}
