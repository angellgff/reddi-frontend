"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useTransition,
  useRef,
} from "react";
import type { StoreMenu as StoreMenuType } from "@/src/lib/finalUser/stores/getStoreMenu";
import TagsTabs from "@/src/components/features/partner/TagsTabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { addItem, selectCartPartnerId } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";
import Toast from "@/src/components/basics/Toast";
import ProductCardRestaurant, {
  ProductCardBase,
} from "./productCards/ProductCardRestaurant";
import ProductDetailsDrawer from "../productDetails/ProductDetailsDrawer";
import ProductCardMarket from "./productCards/ProductCardMarket";
import { useStoreSearchStore } from "@/src/lib/store/store-search";
import Image from "next/image";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentPartnerId = useAppSelector(selectCartPartnerId);
  const scrollersRef = useRef<Record<string, HTMLDivElement | null>>({});
  const pathname = usePathname();

  const { searchQuery, setSearchQuery } = useStoreSearchStore();
  const query = searchQuery;

  // Sync with URL param if needed, but local store is faster for this interaction.
  // const [query, setQuery] = useState(searchParams.get("q") || "");

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  // const nav = useNextRouter();

  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    partnerId: string;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      if (selectedCategory) params.set("category", selectedCategory);
      else params.delete("category");

      // Evitar push si los params no han cambiado
      if (params.toString() !== searchParams.toString()) {
        startTransition(() =>
          router.push(`${pathname}?${params.toString()}`, { scroll: false }),
        );
      }
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCategory]);

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
    const base = Number(p.display_price) || 0;
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
      }),
    );
    setToast({
      open: true,
      msg: "Producto agregado correctamente",
      type: "success",
    });
  };

  const openDetails = (p: ProductCard) => {
    if (!partnerId) return;
    // nav.push(`/user/stores/${partnerId}/product/${p.id}`);
    setSelectedProduct({ id: p.id, partnerId });
  };

  const isRestaurant = partnerType === "restaurant";
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({ open: false, msg: "", type: "info" });

  const shouldShowSearchInMenu = !isRestaurant;

  return (
    <div className="space-y-4">
      <ProductDetailsDrawer
        open={!!selectedProduct}
        onClose={(v) => !v && setSelectedProduct(null)}
        partnerId={selectedProduct?.partnerId || ""}
        productId={selectedProduct?.id || null}
        partnerType={partnerType}
      />
      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
      {/* Search Bar & Categories */}
      <div className="space-y-5 px-1">
        {shouldShowSearchInMenu && (
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none">
              <Image
                src="/new-design/nd-search.png"
                alt="Buscar"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </div>
            <input
              type="text"
              placeholder="Busca en el menú"
              className="w-full pl-14 pr-4 h-[44px] bg-[#EBEBEB] border-none rounded-[11px] text-sm font-semibold text-[#6A6C71] placeholder-[#6A6C71] text-left focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Categories */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto scrollbar-none py-2">
            <TagsTabs
              tags={[{ value: "", label: "Todos" }, ...menu.categories]}
              selectedCategoryId={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id)}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No hay productos que coincidan con los filtros.
        </div>
      ) : (
        groups.map((group) => {
          const isFiltering = !!selectedCategory;
          const productsToShow = isFiltering
            ? group.products
            : group.products.slice(0, 4);

          return (
            <div key={group.id} className="space-y-4">
              {/* Group Title: 'Elegidos por el chef' style and See All button */}
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-bold text-black">{group.name}</h2>
                {!isFiltering && (
                  <button
                    onClick={() => setSelectedCategory(group.id)}
                    className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
                  >
                    Ver todos
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 px-1">
                {productsToShow.map((p) => {
                  const price = Number(p.display_price) || 0;
                  const discount = Number(p.discount_percentage) || 0;
                  const discounted = discount
                    ? price * (1 - discount / 100)
                    : price;
                  const discountedPrice = discounted;

                  const onAdd = (
                    product: ProductCardBase,
                    e: React.MouseEvent,
                  ) => {
                    e.stopPropagation();
                    handleAddToCart(product as unknown as ProductCard);
                  };
                  const onOpen = (product: ProductCardBase) =>
                    openDetails(product as unknown as ProductCard);

                  return (
                    <div key={p.id} className="w-full flex justify-center">
                      {isRestaurant ? (
                        <ProductCardRestaurant
                          product={p as unknown as ProductCardBase}
                          discountedPrice={discountedPrice}
                          isPending={isPending}
                          onAdd={onAdd}
                          onOpen={onOpen}
                        />
                      ) : (
                        <ProductCardMarket
                          product={p as unknown as ProductCardBase}
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
            </div>
          );
        })
      )}
    </div>
  );
}
