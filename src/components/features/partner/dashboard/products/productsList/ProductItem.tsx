import React from "react";
import Image from "next/image";
import Link from "next/link";
import EditPartnerIcon from "@/src/components/icons/EditPartnertIcon";
import DeletePartnerIcon from "@/src/components/icons/DeletePartnerIcon";
import { ProductData } from "@/src/lib/partner/dashboard/type";

// --- COMPONENTE PARA UN SOLO PRODUCTO (ProductItem) ---

type ProductItemProps = {
  product: ProductData;
  onDelete: (id: string) => void;
};

export default function ProductItem({ product, onDelete }: ProductItemProps) {
  return (
    /* Tarjeta del producto */
    <div className="border rounded-xl shadow-sm bg-white overflow-hidden flex flex-col">
      {/* Imagen del producto */}
      <div className="relative h-[90px] w-[135px] mx-auto">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover aspect-auto"
        />
      </div>
      <div className="p-3 flex flex-col gap-2">
        {/* Detalles del producto */}
        <div>
          <p className="font-bold text-sm text-gray-800">
            {product.price.toFixed(2)} {product.currency}
          </p>
          <p className="text-sm text-[#6A6C71] uppercase truncate">
            {product.name}
          </p>
          <p className="text-xs text-[#6A6C71]">{product.description}</p>
        </div>
        {/* Botones de acción */}
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/partner/market/productos/editar/${product.id}`}
            className="inline-flex items-center justify-center gap-2 py-2 text-sm font-medium bg-white border border-black rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-2"
          >
            <EditPartnerIcon className="h-4 w-4" />
            Editar
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            aria-label="Eliminar producto"
            className="p-2 text-white bg-[#DB5151] rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <DeletePartnerIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
