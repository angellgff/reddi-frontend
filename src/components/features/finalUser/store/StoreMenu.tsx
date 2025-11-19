"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useTransition,
  useRef,
} from "react";
import type { StoreMenu as StoreMenuType } from "@/src/lib/finalUser/stores/getStoreMenu";
import Image from "next/image";
import BasicInput from "@/src/components/basics/BasicInput";
import TagsTabs from "@/src/components/features/partner/TagsTabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { addItem, selectCartPartnerId } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";
import Toast from "@/src/components/basics/Toast";
import { useRouter as useNextRouter } from "next/navigation";
import ProductCardRestaurant, {
  ProductCardBase,
} from "./productCards/ProductCardRestaurant";
import ProductCardMarket from "./productCards/ProductCardMarket";
import ArrowLeftIcon from "@/src/components/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/src/components/icons/ArrowRightIcon";

type PartnerType =
  | "market"
  | "restaurant"
  | "liquor_store"
  | string
  | undefined;

export default function StoreMenu({
  menu,
  partnerType,
}: {
  menu: StoreMenuType;
  partnerType?: PartnerType;
}) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentPartnerId = useAppSelector(selectCartPartnerId);
  const scrollersRef = useRef<Record<string, HTMLDivElement | null>>({});

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const nav = useNextRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      if (selectedCategory) params.set("category", selectedCategory);
      else params.delete("category");
      startTransition(() =>
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      );
    }, 250);
    return () => clearTimeout(t);
  }, [
    query,
    selectedCategory,
    searchParams,
    router,
    pathname,
    startTransition,
  ]);

  const groups = menu.groups;

  const partnerId = useMemo(() => {
    const parts = pathname?.split("/") || [];
    const idx = parts.findIndex((p) => p === "stores");
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "";
  }, [pathname]);

  type ProductCard = StoreMenuType["groups"][number]["products"][number];
  const handleAddToCart = (p: ProductCard) => {
    if (currentPartnerId && currentPartnerId !== partnerId) {
      setToast({
        open: true,
        msg: "Solo puedes agregar productos de una tienda a la vez. Vacía el carrito para cambiar de tienda.",
        type: "error",
      });
      return;
    }
    const base = Number(p.base_price) || 0;
    const discount = p.discount_percentage ? Number(p.discount_percentage) : 0;
    const unit = discount ? base * (1 - discount / 100) : base;
    dispatch(
      addItem({
        productId: p.id,
        partnerId,
        name: p.name,
        imageUrl: p.image_url,
        unitPrice: Number(unit.toFixed(2)),
        quantity: 1,
        extras: [],
        mergeByProduct: true,
      })
    );
    dispatch(openCart());
  };

  const openDetails = (p: ProductCard) => {
    if (!partnerId) return;
    nav.push(`/user/stores/${partnerId}/product/${p.id}`);
  };

  const isRestaurant = partnerType === "restaurant";
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({ open: false, msg: "", type: "info" });

  return (
    <div className="space-y-8">
      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
      {/* Search + Categories Bar */}
      <div className="space-y-4">
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto scrollbar-none py-2">
            <TagsTabs
              tags={[{ value: "", label: "Todos" }, ...menu.categories]}
              selectedCategoryId={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
              disabled={isPending}
            />
          </div>
        </div>
        {/* Offer banner placeholder */}
        <div className="rounded-lg bg-emerald-700 text-white px-5 py-3 flex items-center justify-between">
          <div className="text-sm font-medium">
            ¡Oferta especial hoy! Disfruta 25% Off 2 Presas De Pollo. Aplican
            T&C
          </div>
          <button className="text-xs font-semibold bg-white text-emerald-700 px-3 py-1 rounded-md hover:bg-gray-100">
            Ver detalles
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No hay productos que coincidan con los filtros.
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.id} className="space-y-4">
            {/* CAMBIO 1: Contenedor Flex para el título y los botones */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{group.name}</h2>

              {/* CAMBIO 2: Mover los botones aquí y simplificar sus clases */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Scroll left"
                  onClick={() =>
                    scrollersRef.current[group.id]?.scrollBy({
                      left: -300,
                      behavior: "smooth",
                    })
                  }
                  // Se eliminan clases de posicionamiento absoluto
                  className="flex w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow items-center justify-center"
                >
                  <ArrowLeftIcon />
                </button>
                <button
                  type="button"
                  aria-label="Scroll right"
                  onClick={() =>
                    scrollersRef.current[group.id]?.scrollBy({
                      left: 300,
                      behavior: "smooth",
                    })
                  }
                  // Se eliminan clases de posicionamiento absoluto
                  className="flex w-9 h-9 rounded-full bg-emerald-500 shadow items-center justify-center"
                >
                  <ArrowRightIcon fill="#FFFFFF" />
                </button>
              </div>
            </div>

            {/* El contenedor de la lista de productos ya no necesita los botones */}
            <div className="relative">
              {/* Horizontal scroll list */}
              <div
                ref={(el) => {
                  scrollersRef.current[group.id] = el;
                }}
                className="flex gap-4 overflow-x-auto py-1 scroll-smooth scrollbar-none"
              >
                {group.products.map((p) => {
                  const discounted = p.discount_percentage
                    ? p.base_price * (1 - p.discount_percentage / 100)
                    : p.base_price;
                  const discountedPrice = discounted;

                  const onAdd = (
                    product: ProductCardBase,
                    e: React.MouseEvent
                  ) => {
                    e.stopPropagation();
                    handleAddToCart(product as any);
                  };
                  const onOpen = (product: ProductCardBase) =>
                    openDetails(product as any);

                  return (
                    <div key={p.id} className="flex-shrink-0">
                      {isRestaurant ? (
                        <ProductCardRestaurant
                          product={p as any}
                          discountedPrice={discountedPrice}
                          isPending={isPending}
                          onAdd={onAdd}
                          onOpen={onOpen}
                        />
                      ) : (
                        <ProductCardMarket
                          product={p as any}
                          discountedPrice={discountedPrice}
                          isPending={isPending}
                          onAdd={onAdd}
                          onOpen={onOpen}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CAMBIO 3: Los botones de scroll ya no están aquí */}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
