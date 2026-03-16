"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Link from "next/link";
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

  const closeModal = () => {
    router.replace(closeHref, { scroll: false });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
    }
  };

  return (
    <Dialog.Root defaultOpen modal={false} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[1000] bg-black/70"
          onClick={closeModal}
        />
        <Dialog.Content className="fixed inset-x-0 bottom-4 top-4 z-[1010] mx-auto w-[min(1240px,95vw)] overflow-hidden rounded-2xl bg-[#F0F2F5] shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-[#101010]">
              {title}
            </Dialog.Title>
            <Link
              href={closeHref}
              scroll={false}
              aria-label="Cerrar modal"
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <X size={20} />
            </Link>
          </div>

          <div className="h-[calc(100%-72px)] overflow-y-auto px-6 py-6">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
