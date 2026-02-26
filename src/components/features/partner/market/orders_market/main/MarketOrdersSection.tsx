"use client";

import Spinner from "@/src/components/basics/Spinner";
import { MarketPartnerOrderCardProps } from "@/src/components/features/partner/market/orders_market/main/MarketPartnerOrderCard";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useRealtimeOrders } from "@/src/lib/hooks/useRealtimeOrders";
import { formatCurrency } from "@/src/lib/utils";

interface MarketOrdersSectionProps {
  tabs: { value: string; label: string }[];
  orders: MarketPartnerOrderCardProps[];
  scheduledCount: number;
  orderDetailsById: Record<
    string,
    {
      orderId: string;
      items: { id: string; name: string; quantity: number; price: number }[];
      total: number;
      addressDetails: string;
      instructions?: string | null;
    }
  >;
}

export default function MarketOrdersSection({
  orders: initialOrders,
  orderDetailsById,
  scheduledCount,
}: MarketOrdersSectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [isPending, startTransition] = useTransition();

  // Realtime hook
  // Nota: MarketPartnerOrderCardProps es compatible con PartnerOrderCardProps
  // Si TS se queja, tendremos que unificar tipos o castear.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = useRealtimeOrders(
    initialOrders as any,
  ) as unknown as MarketPartnerOrderCardProps[];

  const [leftPaneWidth, setLeftPaneWidth] = useState(36);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedPreparationOrderId, setExpandedPreparationOrderId] = useState<
    string | null
  >(null);

  const statusGroups = useMemo(() => {
    const newOrders = orders.filter(
      (order) => order.status === "new" || order.status === "pending",
    );
    const preparationOrders = orders.filter(
      (order) => order.status === "preparation" || order.status === "scheduled",
    );
    const completedOrders = orders.filter(
      (order) => order.status === "delivered",
    );
    const activeOrders = [...newOrders, ...preparationOrders];
    return { newOrders, preparationOrders, completedOrders, activeOrders };
  }, [orders]);

  useEffect(() => {
    if (
      !expandedPreparationOrderId &&
      statusGroups.preparationOrders.length > 0
    ) {
      setExpandedPreparationOrderId(statusGroups.preparationOrders[0].orderId);
    }
  }, [expandedPreparationOrderId, statusGroups.preparationOrders]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: MouseEvent) => {
      const container = document.getElementById(
        "market-orders-split-container",
      );
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const next = (relativeX / rect.width) * 100;
      const clamped = Math.min(65, Math.max(24, next));
      setLeftPaneWidth(clamped);
    };

    const handleUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const emptyMessage =
    selectedCategory === "scheduled"
      ? "No hay pedidos programados por ahora."
      : "No hay pedidos en esta categoría.";

  const topTabs = [
    {
      value: "",
      label: "Activos",
      count: Math.max(statusGroups.activeOrders.length, scheduledCount),
      countClass: "bg-[#FB2C36] text-white",
    },
    {
      value: "pending",
      label: "Nuevos",
      count: statusGroups.newOrders.length,
      countClass: "bg-[#E5E7EB] text-[#364153]",
    },
    {
      value: "preparation",
      label: "Preparación",
      count: statusGroups.preparationOrders.length,
      countClass: "bg-[#E5E7EB] text-[#364153]",
    },
    {
      value: "delivered",
      label: "Completados",
      count: statusGroups.completedOrders.length,
      countClass: "bg-[#E5E7EB] text-[#364153]",
    },
  ];

  const leftList =
    selectedCategory === "delivered"
      ? statusGroups.completedOrders
      : selectedCategory === "preparation"
        ? statusGroups.preparationOrders
        : selectedCategory === "pending"
          ? statusGroups.newOrders
          : statusGroups.newOrders;

  const rightList =
    selectedCategory === "delivered"
      ? statusGroups.completedOrders
      : statusGroups.preparationOrders;

  return (
    <div className="space-y-4">
      <div className="w-full max-w-[501px] rounded-[10px] bg-[#F3F4F6] p-1">
        <div className="grid grid-cols-4 gap-1">
          {topTabs.map((tab) => {
            const active = selectedCategory === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => !isPending && setSelectedCategory(tab.value)}
                className={`flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium ${
                  active
                    ? "bg-white text-[#101828] shadow-sm"
                    : "text-[#4A5565]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-semibold ${tab.countClass}`}
                >
                  {tab.value === ""
                    ? statusGroups.activeOrders.length
                    : tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="market-orders-split-container"
        className="flex h-[calc(100vh-208px)] min-h-[540px] bg-white"
      >
        {isPending ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <>
            <section
              className="flex h-full flex-col border-r-4 border-[#D1D5DC]"
              style={{ width: `${leftPaneWidth}%` }}
            >
              <div className="flex h-[62px] items-center justify-between border-b-2 border-[#E5E7EB] px-6">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                  <h3 className="font-inter text-sm font-bold uppercase tracking-[0.35px] text-[#101828]">
                    Nuevos
                  </h3>
                </div>
                <span className="font-inter text-sm font-bold text-[#6A7282]">
                  {leftList.length}
                </span>
              </div>

              <div className="overflow-y-auto">
                {leftList.map((order, idx) => {
                  const urgent = idx === 0;
                  return (
                    <div
                      key={order.orderId}
                      className={`relative flex min-h-[94px] items-center gap-6 border-b border-[#E5E7EB] px-6 ${
                        urgent ? "bg-[#FEF2F2]" : "bg-white"
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-0 h-full w-1 ${
                          urgent ? "bg-[#E7000B]" : "bg-[#E5E7EB]"
                        }`}
                      />

                      <div className="w-[64px] shrink-0">
                        <p className="font-inter text-[28px] font-bold tracking-[-0.75px] text-[#101828]">
                          #{order.orderId.slice(0, 4)}
                        </p>
                        <p className="font-inter text-sm font-semibold text-[#4A5565]">
                          {order.timeRemaining}m
                        </p>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-inter text-base font-semibold text-[#101828]">
                          {order.customerName}
                        </p>
                        {urgent && (
                          <span className="mt-1 inline-flex rounded bg-[#E7000B] px-2 py-0.5 font-inter text-xs font-bold text-white">
                            URGENTE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="flex h-12 w-12 items-center justify-center rounded-[10px] text-[#364153]">
                          ×
                        </button>
                        <button className="h-12 rounded-[10px] bg-primary px-6 font-inter text-sm font-semibold text-white">
                          Aceptar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <button
              type="button"
              aria-label="Ajustar paneles"
              onMouseDown={() => setIsDragging(true)}
              className="w-[6px] cursor-col-resize bg-[#D1D5DC] hover:bg-primary/60"
            />

            <section className="flex h-full flex-1 flex-col">
              <div className="flex h-[62px] items-center justify-between border-b-2 border-[#E5E7EB] px-6">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#13835F]" />
                  <h3 className="font-inter text-sm font-bold uppercase tracking-[0.2px] text-[#101828]">
                    En preparación
                  </h3>
                </div>
                <span className="font-inter text-sm font-bold text-[#6A7282]">
                  {rightList.length}
                </span>
              </div>

              <div className="overflow-y-auto">
                {rightList.map((order) => {
                  const expanded = expandedPreparationOrderId === order.orderId;
                  const detail = orderDetailsById[order.orderId];

                  return (
                    <div
                      key={order.orderId}
                      className="relative border-b border-[#E5E7EB] bg-white"
                    >
                      <span className="absolute left-0 top-0 h-full w-1 bg-[#13835F]" />

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPreparationOrderId(order.orderId)
                        }
                        className="flex w-full items-start justify-between px-6 py-4 text-left"
                      >
                        <div>
                          <p className="font-inter text-[28px] font-bold tracking-[-1.1px] text-[#101828]">
                            #{order.orderId.slice(0, 4)}
                          </p>
                          <p className="font-inter text-sm font-semibold text-[#13835F]">
                            {order.timeRemaining}m
                          </p>
                          <p className="mt-1 font-inter text-base font-semibold text-[#101828]">
                            {order.customerName}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-[#E5E7EB] text-black">
                            ✓
                          </div>
                          <div className="flex h-[50px] w-[41px] items-center justify-center rounded-md bg-black text-white">
                            {expanded ? "⌄" : "⌃"}
                          </div>
                        </div>
                      </button>

                      {expanded && detail && (
                        <div className="px-6 pb-4">
                          <div className="space-y-2">
                            {detail.items.slice(0, 5).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between font-inter text-sm"
                              >
                                <p className="text-[#4A5565]">
                                  <span className="mr-2 font-semibold text-[#364153]">
                                    {item.quantity}x
                                  </span>
                                  {item.name}
                                </p>
                                <p className="font-semibold text-[#101828]">
                                  {formatCurrency(item.price * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3">
                            <p className="font-inter text-base font-bold text-[#101828]">
                              Total
                            </p>
                            <p className="font-inter text-lg font-bold text-[#13835F]">
                              {formatCurrency(detail.total)}
                            </p>
                          </div>

                          <div className="mt-3 rounded-md bg-[#F9FAFB] p-3">
                            <p className="font-inter text-xs font-semibold uppercase tracking-[0.5px] text-[#364153]">
                              Dirección de entrega
                            </p>
                            <p className="mt-1 font-inter text-sm text-[#4A5565]">
                              {detail.addressDetails || "Sin detalles"}
                            </p>
                          </div>

                          {detail.instructions && (
                            <div className="mt-2 rounded-md border border-[#FECACA] bg-[#FEF2F2] p-3">
                              <p className="font-inter text-xs font-semibold uppercase tracking-[0.5px] text-[#991B1B]">
                                Instrucciones especiales
                              </p>
                              <p className="mt-1 font-inter text-sm text-[#7F1D1D]">
                                {detail.instructions}
                              </p>
                            </div>
                          )}

                          <div className="mt-3 flex justify-end">
                            <button className="h-12 rounded-[10px] bg-primary px-6 font-inter text-sm font-semibold text-white">
                              Orden Lista
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
