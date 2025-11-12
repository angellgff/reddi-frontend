"use client";

import Spinner from "@/src/components/basics/Spinner";
import TagsTabs from "@/src/components/features/partner/TagsTabs";
import MarketPartnerOrderCard from "@/src/components/features/partner/market/orders_market/main/MarketPartnerOrderCard";
import { MarketPartnerOrderCardProps } from "@/src/components/features/partner/market/orders_market/main/MarketPartnerOrderCard";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface MarketOrdersSectionProps {
  tabs: { value: string; label: string }[];
  orders: MarketPartnerOrderCardProps[];
}

export default function MarketOrdersSection({
  tabs,
  orders,
}: MarketOrdersSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

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
      <div className="flex gap-4">
        <TagsTabs
          tags={tabs}
          selectedCategoryId={selectedCategory}
          onSelectCategory={isPending ? () => {} : setSelectedCategory}
          disabled={isPending}
        />
      </div>
      <div className="h-screen overflow-auto">
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
              <MarketPartnerOrderCard key={order.orderId} {...order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
