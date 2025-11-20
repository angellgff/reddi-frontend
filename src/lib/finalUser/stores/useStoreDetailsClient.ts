"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoresByIds, type StoreDetails } from "./actions";



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
        // If many IDs, chunk to reduce payload
        const CHUNK_SIZE = 10;
        const chunks: string[][] = [];
        for (let i = 0; i < uniqueIds.length; i += CHUNK_SIZE) {
          chunks.push(uniqueIds.slice(i, i + CHUNK_SIZE));
        }

        const collected: StoreDetails[] = [];
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
            const res = await getStoresByIds(part);
            if (!res.success) {
              throw new Error(res.error);
            }
            collected.push(...res.data);
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
        (rows || []).forEach((p) => {
          map[p.id] = p;
        });
        console.debug("useStoreDetailsClient: success", {
          received: rows.length,
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
