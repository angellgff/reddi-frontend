"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import ProductItem from "./ProductItem";
import { ProductData } from "@/src/lib/partner/dashboard/type";
import SearchInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import SearchPartnerIcon from "@/src/components/icons/SearchPartnerIcon";
import ProductImportModal from "../ProductImportModal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Spinner from "@/src/components/basics/Spinner";
import {
  deleteProductAction,
  restoreProductAction,
} from "@/src/app/partner/(session)/market/productos/actions";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import Toast from "@/src/components/basics/Toast";

type ProductsListProps = {
  products: ProductData[];
  categories: { value: string; label: string }[];
};

export default function ProductsSection({
  products,
  categories,
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
  // Estado para Toast
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type?: "success" | "error" | "info";
  }>({ open: false, msg: "" });

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

  return (
    <>
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <h1 className="font-semibold text-gray-800 font-montserrat">
          Lista de productos
        </h1>
        {/* Usamos Link para el botón de añadir nuevo producto */}
        <div className="flex gap-4">
          <Link
            href="productos/nuevo"
            className="px-8 py-2 text-center text-white bg-primary rounded-xl hover:bg-teal-600 transition-colors font-medium text-sm"
          >
            Añadir Nuevo Producto
          </Link>
        </div>
        <ProductImportModal />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
        <SearchInput
          id="search"
          label="Productos"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2"
          icon={<SearchPartnerIcon />}
          disabled={isPending}
        />
        <SelectInput
          id="category"
          label="Categoría"
          options={[{ value: "", label: "Todas" }, ...categories]}
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
          onChange={(e) => handleAvailabilityChange(e.target.value)}
          disabled={isPending}
        />
      </div>

      {/* Grid de Productos */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onDelete={handleDeleteProduct}
              onRestore={handleRestoreProduct}
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
