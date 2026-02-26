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

  useEffect(() => {
    setCounts(initialCounts);
  }, [initialCounts]);

  useEffect(() => {
    if (!partnerId) {
      setCounts(initialCounts ?? EMPTY_COUNTS);
      return;
    }

    const supabase = createClient();
    let isAlive = true;

    const fetchCounts = async () => {
      const nowIso = new Date().toISOString();
      const createCountBase = () =>
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("partner_id", partnerId)
          .neq("status", "awaiting_payment")
          .neq("status", "payment_failed");

      const [pendingNow, preparationNow, delivered, scheduled] =
        await Promise.all([
          createCountBase()
            .eq("status", "pending")
            .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`),
          createCountBase()
            .in("status", ["preparing", "out_for_delivery"])
            .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`),
          createCountBase().eq("status", "delivered"),
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

    const queueRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void fetchCounts().catch((err) => {
          console.error("[orders] realtime indicator refresh failed", err);
        });
      }, 250);
    };

    void fetchCounts().catch((err) => {
      console.error("[orders] initial realtime indicator fetch failed", err);
    });

    const channel = supabase
      .channel(`orders_indicator_realtime_${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `partner_id=eq.${partnerId}`,
        },
        () => {
          queueRefresh();
        },
      )
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
