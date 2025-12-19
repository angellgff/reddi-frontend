import { createClient } from "@/src/lib/supabase/server";
import { Database } from "@/src/lib/database.types";

export type OrderWithPartner = Database["public"]["Tables"]["orders"]["Row"] & {
  partner: {
    name: string;
    image_url: string | null;
  } | null;
};

export type CustomerDetails = Database["public"]["Tables"]["profiles"]["Row"];

export async function getCustomerDetails(customerId: string) {
  const supabase = await createClient();

  const [profileResult, ordersResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", customerId)
      .single(),
    supabase
      .from("orders")
      .select("*, partner:partners(name, image_url)")
      .eq("user_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  if (profileResult.error) {
    console.error("Error fetching profile:", profileResult.error);
    return { profile: null, orders: [] };
  }

  if (ordersResult.error) {
    console.error("Error fetching orders:", ordersResult.error);
    return { profile: profileResult.data, orders: [] };
  }

  return {
    profile: profileResult.data,
    orders: ordersResult.data as unknown as OrderWithPartner[],
  };
}
