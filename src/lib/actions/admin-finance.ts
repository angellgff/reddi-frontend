"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function settleDriverDebt(
  driverId: string,
  amount: number,
  adminId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_settle_driver_debt", {
    p_driver_id: driverId,
    p_amount: amount,
    p_user_id: adminId,
  });

  if (error) {
    console.error("Error settling driver debt:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/finance/drivers");
  return { success: true, data };
}

export async function getDriverCashLogs(driverId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("driver_cash_logs")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching driver logs:", error);
    return [];
  }

  return data;
}
