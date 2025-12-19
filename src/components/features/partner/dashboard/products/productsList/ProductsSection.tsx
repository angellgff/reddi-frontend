"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import ProductItem from "./ProductItem";
import { ProductData } from "@/src/lib/partner/dashboard/type";
import SearchInput from "@/src/components/basics/BasicInput";
import SelectInput from "@/src/components/basics/SelectInput";
import SearchPartnerIcon from "@/src/components/icons/SearchPartnerIcon";
import ProductImportModal from "../ProductImportModal";
import CreateCategoryModal from "./CreateCategoryModal";

type ProductsListProps = {
  products: ProductData[];
  categories: { value: string; label: string }[];
};

export default function ProductsSection({
  products,
  categories,
}: ProductsListProps) {
  // En un componente real, aquí tendrías estados para manejar los inputs:
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Implement filtering logic
  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => {
      // 1. Text Search (Case insensitive, in title or description)
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      // 2. Category Filter
      const matchesCategory =
        !selectedCategory || product.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleDeleteProduct = (id: string) => {
    console.log("Eliminando producto con ID:", id);
    // Aquí iría la lógica para mostrar una confirmación y llamar a la API para eliminar.
    // Esto suele ser una Server Action o una llamada a una API Route.
  };

  const handleCategoryCreated = () => {
    // Opcional: podrías refrescar la lista de categorías manualmente si no es server-side reactive
    // o simplemente el revalidatePath ya lo hará al refrescar la página.
    setIsCategoryModalOpen(false);
  };

  return (
    <>
      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCreated={handleCategoryCreated}
      />
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <h1 className="font-semibold text-gray-800 font-montserrat">
          Lista de productos
        </h1>
        {/* Usamos Link para el botón de añadir nuevo producto */}
        <div className="flex gap-4">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-6 py-2 text-center text-primary bg-white border border-primary rounded-xl hover:bg-green-50 transition-colors font-medium text-sm"
          >
            Crear Categoría
          </button>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
        <SearchInput
          id="search"
          label="Productos"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:col-span-2"
          icon={<SearchPartnerIcon />}
        />
        <SelectInput
          id="category"
          label="Categoría"
          options={categories}
          getOptionValue={(option) => option.value}
          getOptionLabel={(option) => option.label}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        />
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
        {filteredProducts.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onDelete={handleDeleteProduct}
          />
        ))}
      </div>
    </>
  );
}
