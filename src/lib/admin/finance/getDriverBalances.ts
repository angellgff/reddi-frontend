import { createClient } from "@/src/lib/supabase/server";

export interface DriverBalance {
  driver_id: string;
  driver_name: string;
  current_debt: number;
  status: string;
  last_activity?: string; // Optional as per user description B
}

export async function getDriverBalances() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("view_driver_balances")
    .select("*");

  if (error) {
    console.error("Error fetching driver balances:", error);
    return [];
  }

  // Cast to our interface since it's not in database.types.ts yet
  return data as unknown as DriverBalance[];
}
