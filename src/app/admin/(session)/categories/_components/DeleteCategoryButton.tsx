"use client";

import BasicButton from "@/src/components/basics/BasicButton";
import { deleteCategory } from "@/src/lib/actions/admin/categories";
import { useTransition } from "react";
import ConfirmModal from "@/src/components/basics/ConfirmModal";
import { useState } from "react";

export default function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      await deleteCategory(id);
      setShowModal(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
        disabled={isPending}
      >
        Eliminar
      </button>

      <ConfirmModal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar categoría?"
        description="Esta acción no se puede deshacer. Se eliminará la categoría permanentemente."
        confirmText="Eliminar"
        loading={isPending}
      />
    </>
  );
}
