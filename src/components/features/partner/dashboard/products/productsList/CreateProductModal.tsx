"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpenCreate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("create", "true");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Props are kept for API compatibility with ProductsSection.
  void initialSubCategories;
  void availableTags;

  return (
    <button
      type="button"
      onClick={handleOpenCreate}
      className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
    >
      Añadir Nuevo Producto
    </button>
  );
}
