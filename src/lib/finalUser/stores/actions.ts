"use server";

import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
export type StoreDetails = Pick<
  PartnerRow,
  "id" | "name" | "image_url" | "address" | "partner_type" | "phone"
>;

export async function getStoresByIds(ids: string[]) {
  const supabase = await createClient();
  
  // If no IDs, return empty immediately
  if (!ids || ids.length === 0) {
    return { success: true, data: [] as StoreDetails[] } as const;
  }

  const { data, error } = await supabase
    .from("partners")
    .select("id,name,image_url,address,partner_type,phone")
    .in("id", ids);

  if (error) {
    console.error("getStoresByIds error", error);
    return { success: false, error: "Error al cargar tiendas" } as const;
  }

  return { success: true, data: (data as StoreDetails[]) || [] } as const;
}
