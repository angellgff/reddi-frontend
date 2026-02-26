"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import MarketNewProductForm from "@/src/components/features/partner/dashboard/market/newProduct/MarketNewProductForm";
import {
  ProductSubCategory,
  ProductTagDefinition,
} from "@/src/lib/partner/productTypes";

type CreateProductModalProps = {
  initialSubCategories: ProductSubCategory[];
  availableTags: ProductTagDefinition[];
};

export default function CreateProductModal({
  initialSubCategories,
  availableTags,
}: CreateProductModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Añadir Nuevo Producto
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed bottom-4 left-1/2 top-4 z-50 w-[min(1240px,95vw)] -translate-x-1/2 overflow-hidden rounded-2xl bg-[#F0F2F5] shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-[#101010]">
              Crear producto
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar modal"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="h-[calc(100%-72px)] overflow-y-auto px-6 py-6">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <MarketNewProductForm
                initialSubCategories={initialSubCategories}
                availableTags={availableTags}
                onCancel={() => setOpen(false)}
                onCreated={() => setOpen(false)}
              />
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
