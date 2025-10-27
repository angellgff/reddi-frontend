import CouponsClient, { type CouponRow } from "./CouponsClient";
import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/database.types";

export default async function AdminCouponsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("id, code, title, description, start_date, end_date, status")
    .order("created_at", { ascending: false });

  const rows: CouponRow[] = (data ?? []).map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    description: c.description,
    start_date: c.start_date,
    end_date: c.end_date,
    status: c.status as Database["public"]["Enums"]["coupon_status"],
  }));

  return <CouponsClient coupons={rows} />;
}
