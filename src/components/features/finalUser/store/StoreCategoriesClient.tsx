"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import type { StoreMenu as StoreMenuType } from "@/src/lib/finalUser/stores/getStoreMenu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/lib/store/hooks";
import { addItem, selectCartPartnerId, selectCartItems } from "@/src/lib/store/cartSlice";
import { openCart } from "@/src/lib/store/uiSlice";
import Toast from "@/src/components/basics/Toast";
import ProductDetailsDrawer from "../productDetails/ProductDetailsDrawer";
import { useStoreSearchStore } from "@/src/lib/store/store-search";
import Image from "next/image";
import MobileProductCard, { ProductCardBase } from "./productCards/MobileProductCard";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import { useFloatingButtonStore } from "@/src/lib/store/floating-button-store";

type PartnerType =
  | "market"
  | "restaurant"
  | "liquor_store"
  | string
  | undefined;


export default function StoreCategoriesClient({
  menu,
  partnerType,
  storeName,
}: {
  menu: StoreMenuType;
  partnerType?: PartnerType;
  storeName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentPartnerId = useAppSelector(selectCartPartnerId);
  const cartItems = useAppSelector(selectCartItems);
  const showStore = useFloatingButtonStore((state) => state.showStore);

  useEffect(() => {
    if (storeName) {
      showStore(storeName);
    }
  }, [storeName, showStore]);
  
  const pathname = usePathname();

  const { searchQuery, setSearchQuery } = useStoreSearchStore();
  
  // Client-side state for category (defaults to URL param or empty)
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    const params = new URLSearchParams(searchParams.toString());
    if (catId) {
      params.set("category", catId);
    } else {
      params.delete("category");
    }
    // Update URL without full reload/scroll
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  // Compute partnerId from URL
  // CAUTION: The path might be /user/stores/[id]/categories
  const partnerId = useMemo(() => {
    const parts = pathname?.split("/") || [];
    // If the path is .../stores/[id]/categories
    // id is at index of 'stores' + 1
    const idx = parts.findIndex((p) => p === "stores");
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "";
  }, [pathname]);

  // Derived state: Filtered groups
  const filteredGroups = useMemo(() => {
    let groups = menu.groups;

    // Filter by Category
    if (selectedCategory) {
      groups = groups.filter(g => g.id === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      groups = groups.map(g => ({
        ...g,
        products: g.products.filter(p => p.name.toLowerCase().includes(q))
      })).filter(g => g.products.length > 0);
    }
    
    return groups;
  }, [menu.groups, selectedCategory, searchQuery]);

  type ProductCard = StoreMenuType["groups"][number]["products"][number];

  const handleAddToCart = (p: ProductCard) => {
    if (currentPartnerId && currentPartnerId !== partnerId) {
      setToast({
        open: true,
        msg: "Solo puedes agregar productos de una tienda a la vez.",
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
     // Optional: Feedback vibration or small toast
  };

  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    partnerId: string;
  } | null>(null);

  const openDetails = (p: ProductCard) => {
    if (!partnerId) return;
    setSelectedProduct({ id: p.id, partnerId });
  };

  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({ open: false, msg: "", type: "info" });

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div 
      className="relative min-h-[80vh] pb-24 bg-white"
    >
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

      {/* Top Bar: Back & Search */}
       <div className="sticky top-0 z-20 bg-white pt-2 pb-2 px-4 shadow-sm">
         <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-10 h-10 bg-[#F2F2F2] rounded-full flex items-center justify-center">
                 <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
            </button>
            <div className="flex-1 relative">
                 <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Image src="/new-design/nd-search.png" alt="Search" width={16} height={16} />
                 </div>
                 <input
                    type="text"
                    placeholder="Busca en El Nacional"
                    className="w-full pl-10 pr-4 h-10 bg-[#F2F2F2] rounded-full text-sm text-black placeholder-gray-500 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
            </div>
         </div>

         {/* Categories Horizontal Scroll */}
         <div className="flex gap-6 overflow-x-auto scrollbar-none mt-4 pb-2 border-b border-gray-100">
             <button
                onClick={() => setSelectedCategory("")}
                className={`flex-shrink-0 text-sm font-bold whitespace-nowrap transition-colors pb-2 ${
                    selectedCategory === "" 
                    ? "text-black border-b-2 border-black" 
                    : "text-[#6A6C71] border-transparent"
                }`}
             >
                Todos
             </button>
             {menu.categories.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex-shrink-0 text-sm font-bold whitespace-nowrap transition-colors pb-2 ${
                        selectedCategory === cat.value
                        ? "text-black border-b-2 border-black"
                        : "text-[#6A6C71] border-transparent"
                    }`}
                >
                    {cat.label}
                </button>
             ))}
         </div>
       </div>

      {/* Product List */}
      <div className="px-4 py-6 space-y-8">
        {filteredGroups.length === 0 ? (
           <div className="text-center text-gray-500 py-10">
              No se encontraron productos.
           </div>
        ) : (
           filteredGroups.map((group) => (
             <div key={group.id} className="space-y-4">
               {/* Show group title if showing all or filtered */}
               <h2 className="text-xl font-bold text-black">{group.name}</h2>
               
               <div className="grid grid-cols-2 gap-4">
                  {group.products.map((p) => (
                      <MobileProductCard
                        key={p.id}
                        product={p as unknown as ProductCardBase}
                        onAdd={(prod, e) => {
                            e.stopPropagation();
                            handleAddToCart(p);
                        }}
                        onOpen={(prod) => openDetails(p)}
                      />
                  ))}
               </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
}
