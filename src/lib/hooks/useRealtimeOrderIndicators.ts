"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { OrderIndicatorCounts } from "@/src/lib/partner/orders/getOrdersListData";

const EMPTY_COUNTS: OrderIndicatorCounts = {
  active: 0,
  pending: 0,
  preparation: 0,
  delivered: 0,
  scheduled: 0,
};

export function useRealtimeOrderIndicators(
  initialCounts: OrderIndicatorCounts,
  partnerId?: string | null,
) {
  const [counts, setCounts] = useState<OrderIndicatorCounts>(initialCounts);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPartnerRef = useRef<string | null>(partnerId ?? null);

  useEffect(() => {
    setCounts(initialCounts);
  }, [initialCounts]);

  useEffect(() => {
    pendingPartnerRef.current = partnerId ?? null;

    const supabase = createClient();
    let isAlive = true;

    const fetchCounts = async (targetPartnerId: string) => {
      const nowIso = new Date().toISOString();
      const createCountBase = () =>
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("partner_id", targetPartnerId)
          .neq("status", "awaiting_payment")
          .neq("status", "payment_failed");

      const [pendingNow, preparationNow, delivered, scheduled] =
        await Promise.all([
          createCountBase()
            .eq("status", "pending")
            .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`),
          createCountBase()
            .eq("status", "preparing")
            .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`),
          createCountBase().in("status", ["delivered", "out_for_delivery"]),
          createCountBase()
            .in("status", ["pending", "preparing"])
            .not("scheduled_at", "is", null)
            .gt("scheduled_at", nowIso),
        ]);

      if (!isAlive) return;

      const pendingCount = pendingNow.count ?? 0;
      const preparationCount = preparationNow.count ?? 0;
      const deliveredCount = delivered.count ?? 0;
      const scheduledCount = scheduled.count ?? 0;

      setCounts({
        pending: pendingCount,
        preparation: preparationCount,
        delivered: deliveredCount,
        scheduled: scheduledCount,
        active: pendingCount + preparationCount + scheduledCount,
      });
    };

    const queueRefresh = (targetPartnerId: string) => {
      pendingPartnerRef.current = targetPartnerId;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const partnerIdToRefresh = pendingPartnerRef.current;
        if (!partnerIdToRefresh) return;
        void fetchCounts(partnerIdToRefresh).catch((err) => {
          console.error("[orders] realtime indicator refresh failed", err);
        });
      }, 250);
    };

    if (partnerId) {
      void fetchCounts(partnerId).catch((err) => {
        console.error("[orders] initial realtime indicator fetch failed", err);
      });
    } else {
      setCounts(initialCounts ?? EMPTY_COUNTS);
    }

    const channelConfig = {
      event: "*" as const,
      schema: "public",
      table: "orders",
      ...(partnerId ? { filter: `partner_id=eq.${partnerId}` } : {}),
    };

    const channel = supabase
      .channel(`orders_indicator_realtime_${partnerId ?? "fallback"}`)
      .on("postgres_changes", channelConfig, (payload) => {
        const payloadPartnerId =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((payload as any)?.new?.partner_id as string | undefined) ??
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((payload as any)?.old?.partner_id as string | undefined) ??
          null;

        const targetPartnerId = partnerId ?? payloadPartnerId;
        if (!targetPartnerId) return;

        queueRefresh(targetPartnerId);
      })
      .subscribe();

    return () => {
      isAlive = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      void supabase.removeChannel(channel);
    };
  }, [initialCounts, partnerId]);

  return counts;
}
