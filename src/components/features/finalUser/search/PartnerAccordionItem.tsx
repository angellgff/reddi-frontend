"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronDown, Plus, Star } from "lucide-react";
import Link from "next/link";
import { SearchResultPartner } from "@/src/lib/finalUser/search/searchPartners";
import { formatCurrency } from "@/src/lib/utils";
import { useAppDispatch } from "@/src/lib/store/hooks";
import { useAppSelector } from "@/src/lib/store/hooks";
import { addItem, selectCartPartnerId } from "@/src/lib/store/cartSlice";
import { useRouter } from "next/navigation";
import ProductDetailsDrawer from "../productDetails/ProductDetailsDrawer";
import Toast from "@/src/components/basics/Toast";

interface PartnerAccordionItemProps {
  partner: SearchResultPartner;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PartnerAccordionItem({
  partner,
  isOpen,
  onToggle,
}: PartnerAccordionItemProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentPartnerId = useAppSelector(selectCartPartnerId);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    msg: "",
    type: "info",
  });

  // Mock promotional badge logic based on ID to be deterministic
  const discount =
    partner.id.charCodeAt(0) % 3 === 0 ? "10% off en RD$3,500+" : null;

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentPartnerId && currentPartnerId !== partner.id) {
      setToast({
        open: true,
        msg: "Solo puedes agregar productos de una tienda a la vez. Vacía el carrito para cambiar de tienda.",
        type: "error",
      });
      return;
    }

    // Ensure price is a number
    const price = Number(product.display_price ?? product.base_price);
    if (isNaN(price)) {
      console.error("Invalid price for product:", product);
      return;
    }

    dispatch(
      addItem({
        productId: product.id,
        partnerId: partner.id,
        name: product.name,
        imageUrl: product.image_url,
        unitPrice: price,
        quantity: 1,
        extras: [],
      }),
    );
    setToast({
      open: true,
      msg: "Producto agregado al carrito",
      type: "success",
    });
  };

  return (
    <div className="border-b border-gray-100 last:border-0 py-4 relative">
      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      />
      {/* Header Row */}
      <div className="flex items-center justify-between px-4 pb-2">
        <Link
          href={`/user/stores/${partner.id}`}
          className="flex items-center gap-3 flex-1"
        >
          {/* Logo */}
          <div className="w-[50px] h-[50px] relative rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
            <Image
              src={partner.imageUrl || "/placeholder.png"}
              alt={partner.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h3 className="text-[17px] font-bold text-[#292D32] leading-tight font-[Open Sans]">
              {partner.name}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-green-500 text-xs">⚡</span>
              <span className="text-[13px] font-semibold text-gray-700 font-[Open Sans]">
                Rapid {partner.deliveryTime || "41min"}
              </span>
            </div>
            {discount && (
              <div className="mt-1">
                <span className="bg-red-50 text-red-500 text-[10px] px-1.5 py-0.5 rounded font-medium">
                  {discount}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Toggle / Arrow */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          {isOpen ? (
            <ChevronDown size={18} className="text-black" />
          ) : (
            <ChevronRight size={18} className="text-black" />
          )}
        </button>
      </div>

      {/* Expanded Content: Products */}
      {isOpen && (
        <div className="mt-3 pl-4 overflow-x-auto no-scrollbar">
          {partner.products?.length > 0 ? (
            <div className="flex gap-4 pr-4">
              {partner.products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className="min-w-[140px] w-[140px] flex flex-col items-center group cursor-pointer"
                >
                  {/* Product Card */}
                  <div className="relative w-full aspect-[4/3] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-2">
                    <Image
                      src={product.image_url || "/food-placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {/* Add Button */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="absolute bottom-2 right-2 w-6 h-6 bg-[#04BD88] rounded flex items-center justify-center text-white active:scale-95 transition-transform z-10"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="w-full text-left">
                    <span className="block font-bold text-[13px] text-black leading-tight mb-0.5 truncate w-full">
                      {formatCurrency(
                        product.display_price ?? product.base_price,
                      )}
                    </span>
                    <span className="block text-[11px] text-gray-500 leading-tight line-clamp-2 h-[28px]">
                      {product.name}
                    </span>
                    {/* Badge Mock - Using deterministic ID check */}
                    {product.id.charCodeAt(0) % 2 === 0 && (
                      <span className="inline-block mt-1 bg-green-50 text-emerald-600 text-[9px] px-1.5 py-[1px] rounded-full font-medium">
                        Many in Stock
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* View More Link Card */}
              <Link
                href={partner.href}
                className="min-w-[100px] flex flex-col items-center justify-center gap-2 text-gray-500"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <ChevronRight />
                </div>
                <span className="text-xs font-medium">Ver todo</span>
              </Link>
            </div>
          ) : (
            <div className="px-4 text-sm text-gray-500 py-2">
              No hay productos destacados.
              <Link
                href={partner.href}
                className="text-emerald-600 ml-1 font-medium underline"
              >
                Ver tienda
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Product Details Drawer */}
      <ProductDetailsDrawer
        open={!!selectedProductId}
        onClose={() => setSelectedProductId(null)}
        partnerId={partner.id}
        productId={selectedProductId}
        partnerType={partner.partnerType}
      />
    </div>
  );
}
