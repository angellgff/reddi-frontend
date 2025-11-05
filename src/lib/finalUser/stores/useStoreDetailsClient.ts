"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { Database } from "@/src/lib/database.types";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
export type StoreDetails = Pick<
  PartnerRow,
  "id" | "name" | "image_url" | "address" | "partner_type" | "phone"
>;

export function useStoreDetailsClient(partnerIds: string[]) {
  const uniqueIds = useMemo(
    () => Array.from(new Set((partnerIds || []).filter(Boolean))),
    [partnerIds]
  );
  const [data, setData] = useState<Record<string, StoreDetails>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset fast-path when no ids to avoid stale loading states
    if (uniqueIds.length === 0) {
      setData({});
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        console.debug("useStoreDetailsClient: start", {
          ids: uniqueIds,
          count: uniqueIds.length,
        });
        const supabase = createClient();

        // Helper to run a query with AbortController-based timeout
        const runWithAbort = async (
          ids: string[],
          ms: number
        ): Promise<{ data: any[]; error: any }> => {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort("partners-timeout"), ms);
          try {
            // Prefer eq when single id; otherwise IN
            const qb =
              ids.length === 1
                ? supabase
                    .from("partners")
                    .select("id,name,image_url,address,partner_type,phone")
                    .eq("id", ids[0])
                : supabase
                    .from("partners")
                    .select("id,name,image_url,address,partner_type,phone")
                    .in("id", ids);
            const { data, error } = await qb.abortSignal(ctrl.signal);
            return { data: (data as any[]) || [], error };
          } finally {
            clearTimeout(timer);
          }
        };

        // If many IDs, chunk to reduce IN payload and isolate slow ones
        const CHUNK_SIZE = 10;
        const chunks: string[][] = [];
        for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
          chunks.push(uniqueIds.slice(i, i + CHUNK_SIZE));
        }

        const collected: any[] = [];
        for (let idx = 0; idx < chunks.length; idx++) {
          const part = chunks[idx];
          console.debug(
            "useStoreDetailsClient: fetching chunk",
            idx + 1,
            "/",
            chunks.length,
            part
          );
          try {
            let { data: rows, error: qError } = await runWithAbort(part, 3500);
            if (qError || !Array.isArray(rows)) {
              console.warn(
                "useStoreDetailsClient: chunk error/invalid, retrying",
                qError
              );
              ({ data: rows, error: qError } = await runWithAbort(part, 6000));
            }
            if (qError) throw qError;
            collected.push(...rows);
          } catch (e: any) {
            // Surface first failure; UI will show banner
            console.error("useStoreDetailsClient: chunk failed", e);
            throw e;
          }
          if (cancelled) return;
        }

        const rows = collected;
        if (cancelled) return;
        const map: Record<string, StoreDetails> = {};
        (rows || []).forEach((p: any) => {
          map[p.id] = p as StoreDetails;
        });
        console.debug("useStoreDetailsClient: success", {
          received: Array.isArray(rows) ? rows.length : 0,
          keys: Object.keys(map),
        });
        setData(map);
      } catch (e: any) {
        console.error("useStoreDetailsClient: error", e);
        if (!cancelled) setError(e?.message || "Error al cargar tienda");
      } finally {
        if (!cancelled) {
          setLoading(false);
          console.debug("useStoreDetailsClient: end");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [uniqueIds.join(",")]);

  return { data, loading, error } as const;
}
