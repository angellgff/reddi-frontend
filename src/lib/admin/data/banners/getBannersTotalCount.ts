"use server";

import { createClient } from "@/src/lib/supabase/server";

interface GetBannersCountParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  placement?: string;
}

export default async function getBannersTotalCount({
  fromDate,
  toDate,
  status,
  placement,
}: GetBannersCountParams): Promise<number> {
  const supabase = await createClient();

  let query = supabase.from("banners").select("id", { count: "exact", head: true });

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (fromDate) {
    query = query.gte("start_date", fromDate);
  }
  if (toDate) {
    query = query.lte("end_date", toDate);
  }

  if (placement) {
    query = query.eq("placement", placement);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Error fetching banners count:", error);
    return 0;
  }

  return count || 0;
}
