"use client";

import { useState } from "react";
import Image from "next/image";
import { PartnerCategory } from "@/src/app/partner/(session)/restaurant/categorias/actions";
import CategoryModal from "./CategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";

interface CategoriesClientProps {
  initialCategories: PartnerCategory[];
}

export default function CategoriesClient({
  initialCategories,
}: CategoriesClientProps) {
  const [categories, setCategories] =
    useState<PartnerCategory[]>(initialCategories);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<PartnerCategory | null>(
    null
  );
  const [deleteCategory, setDeleteCategory] = useState<PartnerCategory | null>(
    null
  );

  const handleCreated = (newCat: { id: string; name: string }) => {
    setCategories((prev) => [
      ...prev,
      {
        id: newCat.id,
        name: newCat.name,
        imageUrl: null,
        createdAt: new Date().toISOString(),
        productCount: 0,
      },
    ]);
  };

  const handleUpdated = (updated: { id: string; name: string }) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, name: updated.name } : c))
    );
  };

  const handleDeleted = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      {/* Header con botón nuevo */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Mis Categorías</h3>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Nueva categoría
        </button>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="font-medium">No tienes categorías</p>
          <p className="text-sm mt-1">
            Crea tu primera categoría para organizar tu menú
          </p>
        </div>
      )}

      {/* Grid de categorías */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              {/* Imagen */}
              <div className="relative w-full aspect-video mb-3 rounded-lg overflow-hidden bg-gray-200">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <h4 className="font-medium truncate" title={cat.name}>
                {cat.name}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {cat.productCount} producto{cat.productCount !== 1 && "s"}
              </p>

              {/* Acciones */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setEditCategory(cat)}
                  className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteCategory(cat)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <CategoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreated}
      />

      <CategoryModal
        isOpen={!!editCategory}
        onClose={() => setEditCategory(null)}
        onSuccess={handleUpdated}
        category={editCategory ?? undefined}
      />

      <DeleteCategoryModal
        isOpen={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onDeleted={handleDeleted}
        category={deleteCategory ?? undefined}
      />
    </>
  );
}
