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

  const handleDeleteProduct = (id: string) => {
    console.log("Eliminando producto con ID:", id);
    // Aquí iría la lógica para mostrar una confirmación y llamar a la API para eliminar.
    // Esto suele ser una Server Action o una llamada a una API Route.
  };

  return (
    <>
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
        <h1 className="font-semibold text-gray-800 font-montserrat">
          Lista de productos
        </h1>
        {/* Usamos Link para el botón de añadir nuevo producto */}
        <Link
          href="productos/nuevo"
          className="px-8 py-2 text-center text-white bg-primary rounded-xl hover:bg-teal-600 transition-colors font-medium text-sm"
        >
          Añadir Nuevo Producto
        </Link>
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
        {products.map((product) => (
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
