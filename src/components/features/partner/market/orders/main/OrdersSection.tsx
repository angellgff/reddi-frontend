"use client";

import Spinner from "@/src/components/basics/Spinner";
import TagsTabs from "@/src/components/features/partner/TagsTabs";
import PartnerOrderCard from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import { PartnerOrderCardProps } from "@/src/components/features/partner/market/orders/main/PartnerOrderCard";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface OrdersSectionProps {
  tabs: { value: string; label: string }[];
  orders: PartnerOrderCardProps[];
}

export default function OrdersSection({ tabs, orders }: OrdersSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Actualizamos el parámetro 'category'
    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Tabs de categorías */}
      <div className="flex gap-4">
        <TagsTabs
          tags={tabs}
          selectedCategoryId={selectedCategory}
          onSelectCategory={isPending ? () => {} : setSelectedCategory}
          disabled={isPending}
        />
      </div>
      <div className="h-screen overflow-auto">
        {/* Sección de órdenes */}
        {isPending ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No hay pedidos en esta categoría.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <PartnerOrderCard key={order.orderId} {...order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
