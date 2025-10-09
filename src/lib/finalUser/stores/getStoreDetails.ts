import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";

type PartnerRow = Database["public"]["Tables"]["partners"]["Row"];
export type StoreDetails = Pick<
  PartnerRow,
  "id" | "name" | "image_url" | "address" | "partner_type"
>;

export default async function getStoreDetails(
  id: string
): Promise<StoreDetails> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, image_url, address, partner_type")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getStoreDetails error", error);
    throw new Error("Tienda no encontrada");
  }

  return data as StoreDetails;
}
