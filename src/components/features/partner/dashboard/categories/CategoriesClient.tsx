"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PartnerCategory,
  reorderCategoriesAction,
} from "@/src/app/partner/(session)/restaurant/categorias/actions";
import CategoryModal from "./CategoryModal";
import DeleteCategoryModal from "./DeleteCategoryModal";
import { Button } from "@/src/components/ui/button";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

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
    null,
  );
  const [deleteCategory, setDeleteCategory] = useState<PartnerCategory | null>(
    null,
  );
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [loadingReorder, setLoadingReorder] = useState(false);

  const normalizeDisplayOrder = (items: PartnerCategory[]) =>
    items.map((item, index) => ({
      ...item,
      displayOrder: index + 1,
    }));

  const handleCreated = (newCat: {
    id: string;
    name: string;
    displayOrder: number;
  }) => {
    setCategories((prev) =>
      [
        ...prev,
        {
          id: newCat.id,
          name: newCat.name,
          imageUrl: null,
          createdAt: new Date().toISOString(),
          displayOrder: newCat.displayOrder,
          productCount: 0,
        },
      ].sort((a, b) => a.displayOrder - b.displayOrder),
    );
  };

  const handleUpdated = (updated: {
    id: string;
    name: string;
    displayOrder: number;
  }) => {
    setCategories((prev) =>
      prev
        .map((c) =>
          c.id === updated.id
            ? {
                ...c,
                name: updated.name,
                displayOrder: updated.displayOrder,
              }
            : c,
        )
        .sort((a, b) => a.displayOrder - b.displayOrder),
    );
  };

  const handleDeleted = (id: string) => {
    setCategories((prev) =>
      normalizeDisplayOrder(prev.filter((c) => c.id !== id)),
    );
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (loadingReorder) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === categories.length - 1) return;

    const current = [...categories].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const movingItem = current[index];
    current.splice(index, 1);
    current.splice(targetIndex, 0, movingItem);

    const normalized = normalizeDisplayOrder(current);
    const previous = categories;

    setReorderError(null);
    setCategories(normalized);
    setLoadingReorder(true);

    try {
      await reorderCategoriesAction(
        normalized.map((item) => ({
          id: item.id,
          displayOrder: item.displayOrder,
        })),
      );
    } catch (error: unknown) {
      setCategories(previous);
      setReorderError(
        (error as Error)?.message || "No se pudo actualizar el orden",
      );
    } finally {
      setLoadingReorder(false);
    }
  };

  const orderedCategories = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold">Mis categorías</h3>
          <p className="text-sm text-gray-500 mt-1">
            Define el orden en que se muestran a tus clientes.
          </p>
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva categoría
        </Button>
      </div>

      {reorderError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {reorderError}
        </div>
      )}

      {orderedCategories.length === 0 && (
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

      {orderedCategories.length > 0 && (
        <div
          className={`space-y-2 ${loadingReorder ? "opacity-60 pointer-events-none" : ""}`}
        >
          {orderedCategories.map((cat, index) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-gray-400 font-mono w-6 text-center text-sm">
                  {index + 1}
                </span>

                <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-white flex-shrink-0">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      NA
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-medium truncate" title={cat.name}>
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {cat.productCount} producto{cat.productCount !== 1 && "s"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={index === 0 || loadingReorder}
                  onClick={() => handleMove(index, "up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={
                    index === orderedCategories.length - 1 || loadingReorder
                  }
                  onClick={() => handleMove(index, "down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditCategory(cat)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeleteCategory(cat)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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
