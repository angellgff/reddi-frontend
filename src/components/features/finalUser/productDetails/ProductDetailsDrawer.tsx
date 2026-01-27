"use client";

import React, { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { getProductDetailsAction } from "@/src/lib/actions/store";
import ProductDetailsClient from "@/src/components/features/finalUser/productDetails/ProductDetailsClient";
import type { ProductDetails } from "@/src/lib/finalUser/stores/getProductDetails";
import { Loader2 } from "lucide-react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: (open: boolean) => void;
  partnerId: string;
  productId: string | null;
  partnerType?: string;
}

export default function ProductDetailsDrawer({
  open,
  onClose,
  partnerId,
  productId,
  partnerType,
}: Props) {
  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && productId && partnerId) {
      setLoading(true);
      setDetails(null);
      getProductDetailsAction(partnerId, productId)
        .then((data) => {
          setDetails(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, productId, partnerId]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onPointerDownOutside={(e) => {
            // Prevenir cierre si el click fue en el floating bar
            // El floating bar tiene z-index 100, este drawer z-index 61
            // Si el user hace click en el floating bar, Radix detecta click outside.
            // Pero queremos que el floating bar interactue con el ProductDetailsClient dentro del Drawer.
            // Asi que ignoramos el cierre si el target está dentro del floating bar.
            const target = e.target as HTMLElement;
            if (target.closest("footer")) {
              e.preventDefault();
            }
          }}
          className={`fixed left-0 bottom-0 z-[61] w-full bg-white rounded-t-[20px] shadow-lg
            data-[state=open]:animate-in data-[state=closed]:animate-out 
            data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom
            duration-300 flex flex-col max-h-[90vh]`}
        >
          {/* Header handle for visual cue */}
          <div className="w-full h-1 bg-transparent flex justify-center pt-2 pb-1 absolute top-0 left-0 z-10 pointer-events-none">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          <div
            className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative w-full h-full"
            style={{ overscrollBehavior: "contain" }}
          >
            <button
              onClick={() => onClose(false)}
              className="absolute left-4 top-4 z-20 p-2 bg-white/80 rounded-full text-black hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>

            {loading ? (
              <div className="flex h-[300px] w-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : details ? (
              <div className="pb-safe">
                <ProductDetailsClient
                  details={details}
                  partnerType={partnerType}
                />
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-gray-500">
                No se pudo cargar la informaci&oacute;n del producto.
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
