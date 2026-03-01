"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type DishFormModalProps = {
  title: string;
  closeHref: string;
  children: ReactNode;
};

export default function DishFormModal({
  title,
  closeHref,
  children,
}: DishFormModalProps) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.replace(closeHref, { scroll: false });
    }
  };

  return (
    <Dialog.Root open onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed bottom-4 left-1/2 top-4 z-50 w-[min(1240px,95vw)] -translate-x-1/2 overflow-hidden rounded-2xl bg-[#F0F2F5] shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-[#101010]">
              {title}
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
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
