"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { withTimeout } from "@/src/lib/utils";
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
    if (uniqueIds.length === 0) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { data, error } = await withTimeout(
          (async () =>
            await supabase
              .from("partners")
              .select("id,name,image_url,address,partner_type,phone")
              .in("id", uniqueIds))(),
          3000,
          "partners-timeout"
        );
        if (error) throw error;
        if (cancelled) return;
        const map: Record<string, StoreDetails> = {};
        (data || []).forEach((p: any) => {
          map[p.id] = p as StoreDetails;
        });
        setData(map);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error al cargar tienda");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [uniqueIds.join(",")]);

  return { data, loading, error } as const;
}
