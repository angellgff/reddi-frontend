"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { addItem } from "@/src/lib/store/cartSlice";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";

interface ServerProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number | null;
  previousPrice: number | null;
  unit: string | null;
  estimatedTimeRange: string | null;
  imageUrl: string | null;
  partnerId: string;
}

interface DraftProduct {
  name?: string;
  description?: string;
  basePrice?: string; // from form
  previousPrice?: string;
  unit?: string;
  estimatedTimeRange?: string;
  imageObjectUrl?: string | null; // stored in sessionStorage
  partnerId?: string; // might not exist yet
}

export default function ProductPreviewClient({
  serverProduct,
}: {
  serverProduct: ServerProduct | null;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const fromDraft = searchParams.get("draft");
  const productId =
    searchParams.get("productId") || serverProduct?.id || undefined;

  const [draftData, setDraftData] = useState<DraftProduct | null>(null);

  // Load draft from sessionStorage if present
  useEffect(() => {
    if (fromDraft && typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(`marketPreview:${fromDraft}`);
        if (raw) setDraftData(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, [fromDraft]);

  const data = useMemo(() => {
    if (draftData) {
      return {
        name: draftData.name || "Producto sin nombre",
        description: draftData.description || "Sin descripción",
        basePrice: parseFloat(draftData.basePrice || "0") || 0,
        previousPrice: draftData.previousPrice
          ? parseFloat(draftData.previousPrice)
          : null,
        unit: draftData.unit || "/u",
        estimatedTimeRange: draftData.estimatedTimeRange || null,
        imageUrl: draftData.imageObjectUrl || null,
        partnerId: draftData.partnerId || "temp-partner",
      };
    }
    if (serverProduct) {
      return {
        name: serverProduct.name || "Producto sin nombre",
        description: serverProduct.description || "Sin descripción",
        basePrice: serverProduct.basePrice || 0,
        previousPrice: serverProduct.previousPrice || null,
        unit: serverProduct.unit || "/u",
        estimatedTimeRange: serverProduct.estimatedTimeRange || null,
        imageUrl: serverProduct.imageUrl || null,
        partnerId: serverProduct.partnerId,
      };
    }
    return null;
  }, [draftData, serverProduct]);

  const [quantity, setQuantity] = useState<number>(1);

  const discountPercent = useMemo(() => {
    if (!data) return null;
    if (!data.previousPrice || !data.basePrice || data.previousPrice <= 0)
      return null;
    const diff = data.previousPrice - data.basePrice;
    if (diff <= 0) return null;
    return Math.round((diff / data.previousPrice) * 100);
  }, [data]);

  const subtotal = useMemo(() => {
    if (!data) return 0;
    return (data.basePrice || 0) * quantity;
  }, [data, quantity]);

  if (!data) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No hay datos para previsualizar.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl"
        >
          Volver
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    if (!data) return;
    dispatch(
      addItem({
        productId: productId || "temp", // if new product still not created
        partnerId: data.partnerId,
        name: data.name,
        imageUrl: data.imageUrl || undefined,
        unitPrice: data.basePrice,
        quantity,
        extras: [],
      })
    );
  };

  return (
    <div className="flex flex-col items-center px-12 pt-10 pb-16 gap-8 bg-white min-h-screen">
      <button
        type="button"
        onClick={() => router.back()}
        className="self-start -mt-4 mb-2 flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <span className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition-colors">
          <ArrowLeftIcon />
        </span>
        Volver
      </button>
      <div className="w-full max-w-[1340px] rounded-2xl bg-white flex flex-col px-12 py-6 gap-8 border border-transparent">
        {/* Top content: image + info */}
        <div className="flex flex-row gap-8 items-start">
          <div className="w-[188px] h-[254px] bg-gray-100 rounded-md flex items-center justify-center overflow-hidden relative">
            {data.imageUrl ? (
              /* eslint-disable @next/next/no-img-element */
              <img
                src={data.imageUrl}
                alt={data.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-xs text-gray-400 text-center px-2">
                Sin imagen
              </span>
            )}
          </div>
          <div className="flex flex-col gap-5 max-w-[465px]">
            <h1 className="font-medium text-2xl leading-5 text-black">
              {data.name}
            </h1>
            <p className="font-medium text-2xl leading-5 text-black">
              $ {data.basePrice.toFixed(2)} USD{" "}
              <span className="text-base">{data.unit}</span>
            </p>
            <div className="flex flex-row gap-2 items-center text-sm leading-5">
              <span className="text-gray-400">
                $ {data.basePrice.toFixed(2)} USD /und (1 Und)
              </span>
              {data.previousPrice && (
                <span className="text-gray-600 line-through">
                  $ {data.previousPrice.toFixed(2)} USD
                </span>
              )}
              {discountPercent && (
                <span className="text-green-500 font-semibold text-base">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </div>
        </div>
        <hr className="border-gray-300" />
        {/* Description */}
        <div className="flex flex-col gap-5">
          <h2 className="font-semibold text-xl">{data.name}</h2>
          <p className="text-base leading-5 text-black whitespace-pre-line">
            {data.description}
          </p>
        </div>
        {/* Bottom controls */}
        <div className="flex flex-col lg:flex-row w-full items-center justify-between gap-6 bg-gray-100/70 border border-gray-300 rounded-xl px-5 py-5">
          <div className="flex flex-row items-center gap-6">
            <span className="font-medium text-base">Cantidad</span>
            <div className="flex flex-row items-center bg-white border border-gray-300 rounded-full h-11 px-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 py-1 text-gray-600 text-base"
              >
                -
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-1 text-gray-600 text-base"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => {
                handleAdd();
                router.back();
              }}
              className="h-11 px-6 border border-black rounded-xl bg-white text-sm font-medium"
            >
              Añadir y seguir explorando
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="h-11 px-4 rounded-xl flex items-center gap-4 bg-primary text-white text-sm font-medium"
            >
              Agregar{" "}
              <span className="text-white">
                Subtotal: {subtotal.toFixed(2)} USD
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
