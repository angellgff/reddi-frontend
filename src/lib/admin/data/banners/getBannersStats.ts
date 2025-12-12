"use server";

import { createClient } from "@/src/lib/supabase/server";

export interface BannersStatsData {
  activeBanners: number;
  totalClicks: number;
  couponsUsed: number;
}

export default async function getBannersStats(): Promise<BannersStatsData> {
  const supabase = await createClient();

  // 1. Total Active Banners
  const { count: activeBanners, error: activeError } = await supabase
    .from("banners")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (activeError) {
    console.error("Error fetching active banners count:", activeError);
  }

  // 2. Total Clicks
  const { count: totalClicks, error: clicksError } = await supabase
    .from("banner_clicks")
    .select("*", { count: "exact", head: true });

  if (clicksError) {
    console.error("Error fetching total clicks count:", clicksError);
  }

  // 3. Coupons Used (Total usage of coupons that are linked to banners)
  // First get all coupon IDs linked to banners
  // Then sum their times_used. 
  // Optimization: If we just want GLOBAL coupons used, we query coupons directly.
  // Assuming "Descuentos Usados" refers to coupons linked to banners context.
  
  // Strategy: Fetch coupons that are referenced in banners table.
  // Actually simpler: join banners and coupons.
  const { data: couponsData, error: couponsError } = await supabase
    .from("banners")
    .select("coupon_id, coupons(times_used)");

  let couponsUsed = 0;
  if (!couponsError && couponsData) {
    couponsUsed = couponsData.reduce((acc, curr) => {
      // @ts-ignore - Supabase types join handling can be tricky to infer perfectly here without deep generics
      return acc + (curr.coupons?.times_used || 0);
    }, 0);
  } else {
    console.error("Error fetching coupons usage:", couponsError);
  }

  return {
    activeBanners: activeBanners || 0,
    totalClicks: totalClicks || 0,
    couponsUsed,
  };
}
